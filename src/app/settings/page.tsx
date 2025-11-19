
import React from 'react';

export default function SettingsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">الإعدادات العامة</div>
          <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
            إعدادات المشروع التجريبي: ربط Firebase، مفاتيح الخرائط، وخيارات الـ PWA.
          </p>
        </div>
        <span className="chip">Config</span>
      </header>

      <section className="card-grid">
        <article className="card">
          <div className="card-header">
            <span>بيئة العمل (Environment)</span>
          </div>
          <ul style={{ marginTop: 6, fontSize: 13 }}>
            <li>أضف ملف <code>.env.local</code> في جذر المشروع.</li>
            <li>انسخ القيم من <code>.env.example</code> وعدّلها حسب حساباتك.</li>
            <li>تأكّد من تفعيل Firebase Cloud Messaging و Google Maps APIs لحساب مشروعك.</li>
          </ul>
        </article>

        <article className="card">
          <div className="card-header">
            <span>تثبيت كتطبيق (PWA)</span>
          </div>
          <ul style={{ marginTop: 6, fontSize: 13 }}>
            <li>شغّل الأمر <code>npm run dev</code> ثم افتح الموقع من موبايل أندرويد / كروم.</li>
            <li>من القائمة اختر: Add to Home screen.</li>
            <li>يمكنك اختبار الـ offline عن طريق إطفاء الإنترنت وتجربة لوحة التحكم.</li>
          </ul>
        </article>
      </section>
    </>
  );
}
