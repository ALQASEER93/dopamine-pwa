"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Visit } from "../../types/visit";
import {
  getOfflineVisits,
  type OfflineVisitPayload,
} from "../../lib/offline-queue";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusClass(status?: string): string {
  if (!status) return "badge";
  const s = status.toLowerCase();
  if (s === "completed") return "badge badge-completed";
  if (s === "pending") return "badge badge-pending";
  if (s === "cancelled") return "badge badge-cancelled";
  return "badge";
}

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [repId, setRepId] = useState<string>("");
  const [customerQuery, setCustomerQuery] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineVisitPayload[]>([]);

  const loadVisits = useCallback(
    async (nextPage?: number) => {
      const targetPage = nextPage ?? page;

      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("limit", String(limit));
        if (repId.trim()) params.set("repId", repId.trim());
        if (customerQuery.trim()) params.set("customerId", customerQuery.trim());
        if (status.trim()) params.set("status", status.trim());
        if (dateFrom.trim()) params.set("dateFrom", dateFrom.trim());
        if (dateTo.trim()) params.set("dateTo", dateTo.trim());

        const res = await fetch(`/api/visits?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message =
            body && typeof (body as any).error === "string"
              ? (body as any).error
              : `تعذّر تحميل الزيارات (${res.status})`;
          throw new Error(message);
        }

        const data = await res.json();
        setVisits(Array.isArray(data.data) ? data.data : []);
        setPage(data.page || targetPage);
        setTotal(data.total || 0);
      } catch (err: any) {
        console.error("Failed to load visits", err);
        setError(
          err?.message || "حدث خطأ غير متوقّع أثناء تحميل الزيارات."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, repId, customerQuery, status, dateFrom, dateTo]
  );

  useEffect(() => {
    loadVisits(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateOnlineStatus = () => {
      setIsOffline(!window.navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setOfflineQueue(getOfflineVisits());
    } catch {
      // ignore
    }

    const handleStorage = () => {
      try {
        setOfflineQueue(getOfflineVisits());
      } catch {
        // ignore
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadVisits(1);
  };

  const handleResetFilters = () => {
    setRepId("");
    setCustomerQuery("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    loadVisits(1);
  };

  const handlePrevPage = () => {
    if (page <= 1) return;
    const nextPage = page - 1;
    setPage(nextPage);
    loadVisits(nextPage);
  };

  const handleNextPage = () => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadVisits(nextPage);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (repId.trim()) params.set("repId", repId.trim());
    if (customerQuery.trim()) params.set("customerId", customerQuery.trim());
    if (status.trim()) params.set("status", status.trim());
    if (dateFrom.trim()) params.set("dateFrom", dateFrom.trim());
    if (dateTo.trim()) params.set("dateTo", dateTo.trim());
    const url = `/api/visits/export?${params.toString()}`;
    if (typeof window !== "undefined") {
      window.location.href = url;
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">سجل الزيارات</h1>
          <p className="page-subtitle">
            تصفية واستعراض زيارات المندوبين مع إمكانية البحث حسب المندوب،
            العميل، الحالة والتاريخ.
          </p>
        </div>

        <div className="page-actions">
          <Link href="/field-visit" className="btn btn-primary">
            + تسجيل زيارة ميدانية جديدة
          </Link>
        </div>
      </header>

      {offlineQueue.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">
            زيارات محفوظة محلياً (بانتظار المزامنة)
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>وقت التسجيل</th>
                  <th>المندوب</th>
                  <th>العميل</th>
                  <th>الحالة</th>
                  <th>آخر خطأ</th>
                </tr>
              </thead>
              <tbody>
                {offlineQueue.map((v) => (
                  <tr key={v.id}>
                    <td>{formatDate(v.createdAt)}</td>
                    <td>{(v.payload && v.payload.repId) || "-"}</td>
                    <td>{(v.payload && v.payload.customerName) || "-"}</td>
                    <td>{v.status}</td>
                    <td>{v.lastError || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="filter-rep">
              المندوب
            </label>
            <input
              id="filter-rep"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="اكتب اسم أو كود المندوب"
              value={repId}
              onChange={(e) => setRepId(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-customer"
            >
              العميل / الصيدلية
            </label>
            <input
              id="filter-customer"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="بحث بالاسم"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-status"
            >
              حالة الزيارة
            </label>
            <select
              id="filter-status"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="completed">completed</option>
              <option value="pending">pending</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-date-from"
            >
              تاريخ الزيارة من
            </label>
            <input
              id="filter-date-from"
              type="date"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-date-to"
            >
              تاريخ الزيارة إلى
            </label>
            <input
              id="filter-date-to"
              type="date"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              تطبيق الفلاتر
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
              disabled={isLoading}
            >
              إعادة تعيين
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCsv}
              disabled={isLoading}
            >
              تصدير CSV
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {isOffline && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          أنت غير متصل الآن – يتم عرض آخر البيانات المتاحة.
        </div>
      )}

      {isLoading && !visits.length ? (
        <div className="card">
          <p>جاري تحميل الزيارات...</p>
        </div>
      ) : !visits.length ? (
        <div className="card">
          <p>لا توجد زيارات مطابقة حتى الآن.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>تاريخ الزيارة</th>
                  <th>المندوب</th>
                  <th>العميل</th>
                  <th>نوع الزيارة</th>
                  <th>الحالة</th>
                  <th>الملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id}>
                    <td>{formatDate(v.visitDate || v.createdAt)}</td>
                    <td>{v.repId}</td>
                    <td>{(v as any).customerName || (v as any).customerId}</td>
                    <td>{v.visitType || "visit"}</td>
                    <td>
                      <span className={getStatusClass(v.status)}>
                        {v.status || "-"}
                      </span>
                    </td>
                    <td>
                      {v.notes && v.notes.trim()
                        ? v.notes.trim().slice(0, 80)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-slate-300">
            <div>
              صفحة {page} من {totalPages} (إجمالي: {total})
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || page <= 1}
                onClick={handlePrevPage}
              >
                السابقة
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || page >= totalPages}
                onClick={handleNextPage}
              >
                التالية
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

