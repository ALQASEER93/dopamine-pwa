export const dynamic = 'force-dynamic';

import React from 'react';

const mockKpis = [
  { label: 'Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ø²ÙŠØ§Ø±Ø§Øª (Ø¢Ø®Ø± Ù§ Ø£ÙŠØ§Ù…)', value: '42', hint: '+18Ùª Ø¹Ù† Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ Ø§Ù„Ø³Ø§Ø¨Ù‚' },
  { label: 'Ù…ØªÙˆØ³Ø· Ù…Ø¯Ø© Ø§Ù„Ø²ÙŠØ§Ø±Ø©', value: '18 min', hint: 'Ù‡Ø¯Ù Ø§Ù„ÙØ±ÙŠÙ‚: 15â€“20 Ø¯Ù‚ÙŠÙ‚Ø©' },
  { label: 'Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙˆÙ† Ø§Ù„Ù†Ø´Ø·ÙˆÙ† Ø§Ù„ÙŠÙˆÙ…', value: '7 / 9', hint: 'Ù¢ Ù…Ù†Ø¯ÙˆØ¨ Ù„Ù… ÙŠØ¨Ø¯Ø¤ÙˆØ§ Ø¬ÙˆÙ„Ø§ØªÙ‡Ù…' },
  { label: 'Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© (JD)', value: '12,450', hint: 'Ù…Ù† Ø§Ù„ØªØ²Ø§Ù…Ø§Øª Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡ ÙˆØ§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª' },
];

const recentVisits = [
  { rep: 'Hanaa', account: 'Dr. Laila Faris', product: 'Irongene', status: 'completed', duration: '22 min' },
  { rep: 'Mohammad', account: 'BelÃ©via beauty clinic', product: 'Serum C', status: 'completed', duration: '17 min' },
  { rep: 'Sami', account: 'Pharmacy â€“ 3rd Circle', product: 'Procystor', status: 'completed', duration: '13 min' },
  { rep: 'Rama', account: 'Dermacare center', product: 'Whitening cream', status: 'scheduled', duration: 'â€”' },
];

export default function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ù…ÙŠØ¯Ø§Ù†ÙŠØ©</div>
          <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
            Ù†Ø¸Ø±Ø© Ø³Ø±ÙŠØ¹Ø© Ø¹Ù„Ù‰ Ø­Ø±ÙƒØ© Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙŠÙ†ØŒ Ù…Ø¯Ø© Ø§Ù„Ø²ÙŠØ§Ø±Ø§ØªØŒ ÙˆØ§Ù„Ø§Ù„ØªØ²Ø§Ù…Ø§Øª Ø§Ù„Ù…ØªÙˆÙ‚Ø¹Ø© Ø¹Ù„Ù‰ Ù…Ø³ØªÙˆÙ‰ Dopamine Pharma.
          </p>
        </div>
        <span className="chip">Ù†Ø³Ø®Ø© ØªØ¬Ø±ÙŠØ¨ÙŠØ© â€¢ PWA</span>
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
          <span>Ø£Ø­Ø¯Ø« Ø§Ù„Ø²ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù‘Ù„Ø©</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Ù…Ù† ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨ÙŠÙ† (PWA)</span>
        </div>
        <table className="table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Ø§Ù„Ù…Ù†Ø¯ÙˆØ¨</th>
              <th>Ø§Ù„Ø­Ø³Ø§Ø¨</th>
              <th>Ø§Ù„Ù…Ù†ØªØ¬ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠ</th>
              <th>Ø§Ù„Ø­Ø§Ù„Ø©</th>
              <th>Ø§Ù„Ù…Ø¯Ø©</th>
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
                    {v.status === 'completed' ? 'Ù…ÙƒØªÙ…Ù„Ø©' : 'Ù…Ø¬Ø¯ÙˆÙ„Ø©'}
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
