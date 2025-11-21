"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import type { Task } from "../../types/task";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);

  const [repId, setRepId] = useState<string>("");
  const [status, setStatus] = useState<string>("open");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(
    async (nextPage?: number) => {
      const targetPage = nextPage ?? page;
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("limit", String(limit));
        if (repId.trim()) params.set("repId", repId.trim());
        if (status) params.set("status", status);
        if (dateFrom.trim()) params.set("dateFrom", dateFrom.trim());
        if (dateTo.trim()) params.set("dateTo", dateTo.trim());

        const res = await fetch(`/api/tasks?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const message =
            body && typeof (body as any).error === "string"
              ? (body as any).error
              : `تعذّر تحميل المهام (${res.status})`;
          throw new Error(message);
        }

        const data = await res.json();
        setTasks(Array.isArray(data.data) ? data.data : []);
        setPage(data.page || targetPage);
        setTotal(data.total || 0);
      } catch (err: any) {
        console.error("Failed to load tasks", err);
        setError(
          err?.message || "حدث خطأ غير متوقّع أثناء تحميل المهام."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, repId, status, dateFrom, dateTo]
  );

  useEffect(() => {
    loadTasks(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTasks(1);
  };

  const handleResetFilters = () => {
    setRepId("");
    setStatus("open");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    loadTasks(1);
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const nextStatus = task.status === "open" ? "done" : "open";
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update task");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      console.error("Failed to toggle task status", err);
      setError(
        err?.message || "حدث خطأ أثناء تحديث حالة المهمة."
      );
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const isOverdue = (task: Task) => {
    if (task.status !== "open") return false;
    if (!task.dueDate) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    return due < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const isDueToday = (task: Task) => {
    if (!task.dueDate) return false;
    const now = new Date();
    const due = new Date(task.dueDate);
    return (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    );
  };

  const getDueBadgeClass = (task: Task) => {
    if (isOverdue(task)) return "status-badge status-error";
    if (isDueToday(task)) return "status-badge status-pending";
    return "status-badge status-completed";
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">مهام المتابعة</h1>
          <p className="page-subtitle">
            قائمة بالمهام الناتجة عن زيارات المندوبين (اتصال، زيارة، إيميل...)
            مع إمكانية متابعتها وإغلاقها.
          </p>
        </div>
      </header>

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
              htmlFor="filter-status"
            >
              حالة المهمة
            </label>
            <select
              id="filter-status"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">كل الحالات</option>
              <option value="open">مفتوحة</option>
              <option value="done">منتهية</option>
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="filter-date-from"
            >
              تاريخ الاستحقاق من
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
              تاريخ الاستحقاق إلى
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
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <strong>خطأ:</strong> {error}
        </div>
      )}

      {isLoading && !tasks.length ? (
        <div className="card">
          <p>جاري تحميل المهام...</p>
        </div>
      ) : !tasks.length ? (
        <div className="card">
          <p>لا توجد مهام مطابقة حالياً.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>تاريخ الاستحقاق</th>
                  <th>المندوب</th>
                  <th>العميل</th>
                  <th>نوع المتابعة</th>
                  <th>العنوان</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className={getDueBadgeClass(t)}>
                        {formatDate(t.dueDate)}
                      </span>
                    </td>
                    <td>{t.repId}</td>
                    <td>{t.customerName}</td>
                    <td>{t.type}</td>
                    <td>{t.title}</td>
                    <td>{t.status === "open" ? "مفتوحة" : "منتهية"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleToggleStatus(t)}
                        disabled={isLoading}
                      >
                        {t.status === "open" ? "وضع منتهية" : "إعادة فتح"}
                      </button>
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
                onClick={() => loadTasks(page - 1)}
              >
                السابقة
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isLoading || page >= totalPages}
                onClick={() => loadTasks(page + 1)}
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

