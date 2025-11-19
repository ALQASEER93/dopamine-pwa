
import React from 'react';

export default function VisitsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">سجّل الزيارات (نسخة PWA)</div>
          <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
            في النسخة الكاملة، هذه الشاشة ترتبط مباشرة بجدول الزيارات في MongoDB وتعرض زيارات المندوبين مع GPS ومدة كل زيارة.
          </p>
        </div>
        <span className="chip">Phase 1 • Skeleton</span>
      </header>

      <section className="card" style={{ marginTop: 12 }}>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          في هذا الـ skeleton ركّزنا على:
        </p>
        <ul style={{ fontSize: 13 }}>
          <li>تهيئة PWA و manifest و service worker.</li>
          <li>تهيئة Google Maps للوحة خريطة المندوبين.</li>
          <li>بناء تصميم أساسي للوحة التحكم متوافق مع RTL ومظهر أنيق.</li>
        </ul>
        <p style={{ marginTop: 8, fontSize: 13, color: '#9ca3af' }}>
          الخطوة التالية هي ربط هذه الشاشة بـ API فعلي (Next.js Route Handlers + MongoDB) واستقبال زيارات المندوبين من تطبيق الجوال.
        </p>
      </section>
    </>
  );
}
