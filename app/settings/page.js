export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>الإعدادات</h1>
      <p style={{ color: '#9ca3af', marginBottom: 16 }}>
        تذكير سريع بالقيم التي يجب ضبطها في ملف البيئة <code>.env.local</code>.
      </p>

      <div className="card">
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
{`MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=medicrm-3yee6
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
`}
        </pre>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          بعد ضبط هذه القيم وتشغيل <code>npm run dev</code> يصبح التطبيق جاهزاً
          للتثبيت كـ PWA على الموبايل.
        </p>
      </div>
    </div>
  );
}

