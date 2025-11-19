
# Dopamine Pharma – Field Force PWA (Skeleton)

هذا المشروع هو نسخة **PWA تجريبية أساسية** لمشروعك الكبير:
تتبع المندوبين، تسجيل الزيارات مع GPS، ولوحة تحكم حديثة تعمل كتطبيق يمكن تثبيته على الموبايل (Android / iOS via browser).

## 1. المزايا الموجودة في هذا الـ Skeleton

- Next.js 14 (App Router) + React 18 + TypeScript.
- PWA جاهز (manifest + service worker عبر `next-pwa`) – يمكن تثبيته كـ App.
- تصميم Dashboard داكن ومناسب للهوية الحديثة لـ Dopamine Pharma.
- صفحة خريطة المندوبين `/reps-map` مهيأة لـ Google Maps:
  - تستخدم `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
  - حالياً تعرض بيانات تجريبية (mock) ويمكن ربطها بـ MongoDB لاحقاً.
- إعداد Firebase جاهز (ملف `src/lib/firebase.ts`) لاستخدام:
  - Firebase Cloud Messaging (Notifications) لاحقاً.
- إعداد MongoDB مع helper جاهز في `src/lib/mongodb.ts`.
- API بسيط للزيارات في `src/app/api/visits/route.ts` (GET/POST).

هذه النسخة هي **Phase 1 – Skeleton**:
الهدف أن يكون لديك مشروع نظيف يمكنك تشغيله فوراً ثم نبدأ ببناء كل الموديولات (CRM كامل، تتبع لحظي، geofencing، تقارير، صلاحيات…).

---

## 2. المتطلبات

- Node.js 18 أو أعلى.
- حساب MongoDB (Atlas أو محلي).
- مشروع Firebase مفعّل فيه Cloud Messaging (لاحقاً).
- مفتاح Google Maps JavaScript API.

---

## 3. خطوات التشغيل محلياً

1. فك الضغط للمجلد `dopamine-pwa`.
2. ادخل للمجلد:

   ```bash
   cd dopamine-pwa
   ```

3. انسخ ملف البيئة:

   ```bash
   cp .env.example .env.local
   ```

4. عدّل `.env.local`:

   - `MONGODB_URI` → رابط قاعدة بياناتك (مثلاً Atlas).
   - مفاتيح Firebase من مشروعك `medicrm-3yee6`.
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` → مفتاح الخرائط.

5. ثم ثبّت الحزم:

   ```bash
   npm install
   ```

6. شغّل المشروع:

   ```bash
   npm run dev
   ```

7. افتح المتصفح على:

   - `http://localhost:3000` → لوحة التحكم.
   - `http://localhost:3000/reps-map` → خريطة حركة المندوبين.

من موبايل Android (Chrome) افتح نفس العنوان، ستلاحظ خيار **Add to Home screen** لتثبيت التطبيق كـ PWA.

---

## 4. أين نضيف الموديولات القادمة؟

- **API متقدّم للزيارات / الحسابات / المستخدمين**
  - داخل `src/app/api/...` نضيف route handlers لكل موديول (مثلاً `api/accounts`, `api/reps`).
- **شاشة تسجيل الزيارة للمندوب (مع GPS + Timer)**
  - صفحة جديدة مثلاً تحت `/rep/visits/new` أو PWA خاصة بالـ reps.
- **التتبع اللحظي وجمع نقاط GPS**
  - موديول جديد يستخدم `navigator.geolocation.watchPosition` ويكتب البيانات في MongoDB.
- **تقارير الإدارة**
  - صفحات داخل `/reports/...` مع جداول وتحليلات وتصدير Excel/PDF.

هذا المشروع هو الأساس، جاهز للبناء عليه مباشرة.

