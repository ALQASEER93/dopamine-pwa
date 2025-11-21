const ENV_KEYS = [
  { key: "MONGODB_URI", label: "رابط قاعدة بيانات MongoDB" },
  { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", label: "مفتاح Google Maps (فرونت إند)" },
  { key: "FIREBASE_API_KEY", label: "مفتاح Firebase API" },
  { key: "FIREBASE_PROJECT_ID", label: "معرّف مشروع Firebase" },
  { key: "FIREBASE_MESSAGING_SENDER_ID", label: "Firebase Messaging Sender ID" },
  { key: "FIREBASE_APP_ID", label: "Firebase App ID" },
];

export default function SettingsPage() {
  return (
    <>
      <header className="page-header">
        <div>
          <div className="page-title">إعدادات التطبيق والبيئة</div>
          <p style={{ marginTop: 4, fontSize: 13, color: "#9ca3af" }}>
            هذه الصفحة تساعدك على التأكد من جهوزية التطبيق قبل النشر النهائي،
            عبر التحقق من أهم متغيرات البيئة (.env.local وبيئة Vercel).
          </p>
        </div>
        <span className="chip">Environment</span>
      </header>

      <section className="card-grid">
        <article className="card">
          <div className="card-header">
            <span>حالة متغيرات البيئة الأساسية</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 13, color: "#9ca3af" }}>
            تأكد أن كل متغير بيئة مهم موجود قبل تشغيل التطبيق في الإنتاج. إذا
            كان المتغير غير موجود سترى تلميحاً لإضافته.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            {ENV_KEYS.map(({ key, label }) => {
              const value = process.env[key];
              const isPresent = !!value;

              return (
                <div
                  key={key}
                  className="flex items-start justify-between gap-3 py-2 border-b border-slate-800/60 last:border-b-0"
                >
                  <div>
                    <div className="text-slate-100">{label}</div>
                    <div className="text-[11px] text-slate-400">{key}</div>
                    {!isPresent && (
                      <div className="mt-1 text-[11px] text-red-300">
                        أضِف هذا المتغيّر إلى ملف <code>.env.local</code> وبيئة
                        Vercel.
                      </div>
                    )}
                  </div>
                  <span
                    className={`status-badge ${
                      isPresent ? "status-completed" : "status-pending"
                    }`}
                  >
                    {isPresent ? "موجود" : "غير موجود"}
                  </span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}

