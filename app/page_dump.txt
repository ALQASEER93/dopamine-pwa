export default function DashboardPage() {
  const kpis = [
    { label: 'إجمالي الزيارات اليوم', value: '12' },
    { label: 'مندوبي الميدان النشطين الآن', value: '4' },
    { label: 'متوسط مدة الزيارة', value: '18 دقيقة' },
    { label: 'طلبات متوقعة من اليوم', value: '1,250 JOD' }
  ];

  const visits = [
    {
      id: 1,
      date: '2025-11-18',
      rep: 'Hanaa',
      account: 'Dr. Laila Faris',
      status: 'completed',
      duration: '22 min'
    },
    {
      id: 2,
      date: '2025-11-18',
      rep: 'Mohammad',
      account: 'Al-Nahdi Pharmacy',
      status: 'completed',
      duration: '16 min'
    }
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>لوحة التحكم</h1>
      <p style={{ color: '#9ca3af', marginBottom: 24 }}>
        نظرة سريعة على أداء فريق المندوبين وزيارات اليوم.
      </p>

      <div className="card-grid">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card">
            <div className="card-title">{kpi.label}</div>
            <div className="card-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">آخر الزيارات</div>
        <table className="table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المندوب</th>
              <th>العميل</th>
              <th>الحالة</th>
              <th>المدة</th>
            </tr>
          </thead>
          <tbody>
            {visits.map(v => (
              <tr key={v.id}>
                <td>{v.date}</td>
                <td>{v.rep}</td>
                <td>{v.account}</td>
                <td>
                  <span className="badge badge-completed">مكتملة</span>
                </td>
                <td>{v.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

