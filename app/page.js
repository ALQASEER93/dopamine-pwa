import { serverFetch } from "@/lib/server-fetch";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function DashboardPage() {
  let stats = null;
  let statsError = null;
  let visits = [];

  try {
    // نستخدم serverFetch لتفادي ERR_INVALID_URL في بيئة Node
    // ولتوحيد base URL بين dev و Vercel (VERCEL_URL).
    const res = await serverFetch("/api/stats", {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        stats = json.data;
      } else {
        statsError = json.error || "Failed to load stats";
      }
    } else {
      statsError = `Failed to load stats (${res.status})`;
    }
  } catch (err) {
    console.error("Failed to load stats", err);
    statsError = "Failed to load stats";
  }

  const kpis = [
    {
      label: "إجمالي الزيارات اليوم",
      value:
        stats && typeof stats.totalVisitsToday === "number"
          ? String(stats.totalVisitsToday)
          : "—",
    },
    {
      label: "إجمالي الزيارات هذا الأسبوع",
      value:
        stats && typeof stats.totalVisitsThisWeek === "number"
          ? String(stats.totalVisitsThisWeek)
          : "—",
    },
    {
      label: "عدد المندوبين النشطين الآن",
      value:
        stats && typeof stats.activeRepsNow === "number"
          ? String(stats.activeRepsNow)
          : "—",
    },
    {
      label: "متوسط مدة الزيارة (دقائق)",
      value:
        stats && typeof stats.avgVisitDurationMinutes === "number"
          ? String(stats.avgVisitDurationMinutes)
          : "—",
    },
  ];

  try {
    const res = await serverFetch("/api/visits", {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      visits = json.data ?? [];
    }
  } catch (err) {
    console.error("Failed to load latest visits for dashboard", err);
    visits = [];
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>لوحة التحكم</h1>
      <p style={{ color: "#9ca3af", marginBottom: 24 }}>
        نظرة عامة سريعة على أداء الفريق الميداني وزيارات اليوم والأسبوع.
      </p>

      <div className="card-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card">
            <div className="card-title">{kpi.label}</div>
            <div className="card-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      {statsError && (
        <p
          style={{
            marginTop: 8,
            marginBottom: 16,
            fontSize: 12,
            color: "#fca5a5",
          }}
        >
          تعذّر تحميل الإحصائيات الحية حالياً، يتم عرض لوحة التحكم بدون تأثير
          على بقية الصفحات.
        </p>
      )}

      <div className="card">
        <div className="card-title">آخر الزيارات المسجّلة</div>
        <table className="table">
          <thead>
            <tr>
              <th>المندوب</th>
              <th>العميل</th>
              <th>تاريخ الزيارة</th>
              <th>الحالة</th>
              <th>المدة (دقائق)</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v._id || v.id}>
                <td>{v.repId}</td>
                <td>{v.customerName || v.customerId}</td>
                <td>{formatDate(v.visitDate || v.createdAt)}</td>
                <td>
                  <span className="badge badge-completed">{v.status}</span>
                </td>
                <td>
                  {typeof v.elapsedSeconds === "number"
                    ? Math.round(v.elapsedSeconds / 60)
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
