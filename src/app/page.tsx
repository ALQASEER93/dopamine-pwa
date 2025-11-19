
import React from 'react';

const mockKpis = [
  { label: 'إجمالي الزيارات (آخر ٧ أيام)', value: '42', hint: '+18٪ عن الأسبوع السابق' },
  { label: 'متوسط مدة الزيارة', value: '18 min', hint: 'هدف الفريق: 15–20 دقيقة' },
  { label: 'المندوبون النشطون اليوم', value: '7 / 9', hint: '٢ مندوب لم يبدؤوا جولاتهم' },
  { label: 'الطلبات المتوقعة (JD)', value: '12,450', hint: 'من التزامات الأطباء والصيدليات' },
];

const recentVisits = [
  { rep: 'Hanaa', account: 'Dr. Laila Faris', product: 'Irongene', status: 'completed', duration: '22 min' },
  { rep: 'Mohammad', account: 'Belévia beauty clinic', product: 'Serum C', status: 'completed', duration: '17 min' },
  { rep: 'Sami', account: 'Pharmacy – 3rd Circle', product: 'Procystor', status: 'completed', duration: '13 min' },
  { rep: 'Rama', account: 'Dermacare center', product: 'Whitening cream', status: 'scheduled', duration: '—' },
];

export default function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">لوحة التحكم الميدانية</div>
          <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
            نظرة سريعة على حركة المندوبين، مدة الزيارات، والالتزامات المتوقعة على مستوى Dopamine Pharma.
          </p>
        </div>
        <span className="chip">نسخة تجريبية • PWA</span>
      </header>

      <section className="card-grid">
        {mockKpis.map((kpi) => (
          <article key={kpi.label} className="card">
            <div className="card-header">
              <span>{kpi.label}</span>
            </div>
            <div className="metric-value">{kpi.value}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>{kpi.hint}</div>
          </article>
        ))}
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <div className="card-header">
          <span>أحدث الزيارات المسجّلة</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>من تطبيق المندوبين (PWA)</span>
        </div>
        <table className="table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>المندوب</th>
              <th>الحساب</th>
              <th>المنتج الرئيسي</th>
              <th>الحالة</th>
              <th>المدة</th>
            </tr>
          </thead>
          <tbody>
            {recentVisits.map((v, idx) => (
              <tr key={idx}>
                <td>{v.rep}</td>
                <td>{v.account}</td>
                <td>{v.product}</td>
                <td>
                  <span className={v.status === 'completed' ? 'badge' : 'badge-warning'}>
                    {v.status === 'completed' ? 'مكتملة' : 'مجدولة'}
                  </span>
                </td>
                <td>{v.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
