"use client";

import { useEffect, useState, useTransition, FormEvent } from "react";
import type { Customer, CustomerType } from "../../types/customer";

type CustomersResponse = {
  success: boolean;
  data: Customer[];
  page: number;
  limit: number;
  total: number;
};

const CUSTOMER_TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: "pharmacy", label: "صيدلية" },
  { value: "doctor", label: "طبيب" },
  { value: "hospital", label: "مستشفى" },
  { value: "other", label: "أخرى" },
];

interface CustomersClientProps {
  initial: CustomersResponse;
}

export default function CustomersClient({ initial }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initial.data);
  const [page, setPage] = useState<number>(initial.page);
  const [limit] = useState<number>(initial.limit);
  const [total, setTotal] = useState<number>(initial.total);

  const [search, setSearch] = useState<string>("");
  const [type, setType] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [newType, setNewType] = useState<CustomerType>("pharmacy");
  const [specialty, setSpecialty] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loadCustomers = (nextPage: number, opts?: { keepFilters?: boolean }) => {
    startTransition(async () => {
      try {
        setError(null);
        setSuccess(null);

        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        params.set("limit", String(limit));
        if (opts?.keepFilters) {
          if (search.trim()) params.set("search", search.trim());
          if (type) params.set("type", type);
        }

        const res = await fetch(`/api/customers?${params.toString()}`, {
          cache: "no-store",
        });
        const data: CustomersResponse = await res.json();

        if (!res.ok || !data.success) {
          throw new Error((data as any).error || "Failed to load customers");
        }

        setCustomers(data.data);
        setPage(data.page);
        setTotal(data.total);
      } catch (err: any) {
        console.error("Failed to load customers", err);
        setError(
          err?.message || "حدث خطأ غير متوقّع أثناء تحميل العملاء."
        );
      }
    });
  };

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    loadCustomers(1, { keepFilters: true });
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("");
    loadCustomers(1);
  };

  const handleCreateCustomer = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("الرجاء إدخال اسم العميل أو الصيدلية.");
      return;
    }

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          type: newType,
          specialty: specialty.trim() || undefined,
          region: region.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create customer");
      }

      setName("");
      setSpecialty("");
      setRegion("");
      setPhone("");
      setNewType("pharmacy");
      setSuccess("تم إضافة العميل بنجاح.");

      loadCustomers(1, { keepFilters: true });
    } catch (err: any) {
      console.error("Failed to create customer", err);
      setError(
        err?.message || "حدث خطأ غير متوقّع أثناء إنشاء العميل."
      );
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getTypeLabel = (t: CustomerType) => {
    const entry = CUSTOMER_TYPE_OPTIONS.find((opt) => opt.value === t);
    return entry ? entry.label : t;
  };

  useEffect(() => {
    setCustomers(initial.data);
    setPage(initial.page);
    setTotal(initial.total);
  }, [initial.data, initial.page, initial.total]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">إدارة العملاء (أطباء / صيدليات)</h1>
          <p className="page-subtitle">
            إدارة بيانات الأطباء والصيدليات والمستشفيات لإعادة استخدامها في زيارات
            المندوبين بدلاً من الكتابة اليدوية في كل مرة.
          </p>
        </div>
      </header>

      {/* إنشاء عميل جديد */}
      <div className="card" style={{ marginBottom: 16 }}>
        <form
          onSubmit={handleCreateCustomer}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="cust-name">
              اسم العميل / الطبيب
            </label>
            <input
              id="cust-name"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="مثال: صيدلية الرابية أو د. أحمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="cust-type">
              نوع العميل
            </label>
            <select
              id="cust-type"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={newType}
              onChange={(e) => setNewType(e.target.value as CustomerType)}
            >
              {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-1">
            <label
              className="block text-sm text-slate-300"
              htmlFor="cust-specialty"
            >
              التخصص (اختياري)
            </label>
            <input
              id="cust-specialty"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="مثال: قلبية، أطفال..."
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="cust-region">
              المنطقة (اختياري)
            </label>
            <input
              id="cust-region"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="مثال: الرابية - عمّان"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="cust-phone">
              رقم الهاتف (اختياري)
            </label>
            <input
              id="cust-phone"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="مثال: 079xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            إضافة عميل
          </button>
        </form>
        {success && (
          <p className="text-xs text-emerald-400 mt-2">{success}</p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-2">{error}</p>
        )}
      </div>

      {/* فلاتر البحث */}
      <div className="card" style={{ marginBottom: 16 }}>
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="search-name">
              البحث بالاسم
            </label>
            <input
              id="search-name"
              type="text"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="جزء من اسم العميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="block text-sm text-slate-300" htmlFor="filter-type">
              نوع العميل
            </label>
            <select
              id="filter-type"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">كل الأنواع</option>
              {CUSTOMER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              تطبيق الفلاتر
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isPending}
              onClick={handleResetFilters}
            >
              إعادة تعيين
            </button>
          </div>
        </form>
      </div>

      {/* جدول العملاء */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>التخصص</th>
                <th>المنطقة</th>
                <th>رقم الهاتف</th>
                <th>تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{getTypeLabel(c.type)}</td>
                  <td>{c.specialty || "-"}</td>
                  <td>{c.region || "-"}</td>
                  <td>{c.phone || "-"}</td>
                  <td>{formatDate(c.createdAt)}</td>
                </tr>
              ))}
              {!customers.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    لا توجد نتائج مطابقة حالياً.
                  </td>
                </tr>
              )}
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
              disabled={isPending || page <= 1}
              onClick={() => loadCustomers(page - 1, { keepFilters: true })}
            >
              السابقة
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isPending || page >= totalPages}
              onClick={() => loadCustomers(page + 1, { keepFilters: true })}
            >
              التالية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

