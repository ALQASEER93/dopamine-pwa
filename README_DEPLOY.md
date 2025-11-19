# دليل نشر مشروع Dopamine PWA على Vercel

هذا الملف موجّه لعمر ليوضح خطوات نشر مشروع `dopamine-pwa` على Vercel (الخطة المجانية)، وربطه مع GitHub.

---

## 1 – المتطلبات قبل النشر

- حساب مجاني على **Vercel**:  
  افتح: https://vercel.com/signup  
  ويمكن التسجيل بحساب GitHub أو بريد إلكتروني (لا تحتاج بطاقة ائتمان للخطة المجانية).

- حساب مجاني على **GitHub**:  
  إذا لم يكن لديك حساب: https://github.com/signup

- مشروع Next.js موجود على جهازك في مجلد مثل:  
  `C:\...\dopamine-pwa`

---

## 2 – تجهيز المستودع على GitHub

من داخل مجلد المشروع `dopamine-pwa`، نفّذ الأوامر التالية مرة واحدة لإنشاء مستودع وربطه بـ GitHub (عدّل `USERNAME` قبل التنفيذ):

```bash
git init
git add .
git commit -m "Initial Dopamine CRM PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/dopamine-crm-pwa.git
git push -u origin main
```

- استبدل `USERNAME` باسم المستخدم الحقيقي لحسابك على GitHub.
- يمكنك اختيار اسم آخر للمستودع بدل `dopamine-crm-pwa` إذا أحببت، لكن استخدم نفس الاسم في الرابط والأوامر.

بعد هذه الخطوة، سيكون المشروع مرفوعاً على GitHub وجاهزاً للربط مع Vercel.

---

## 3 – ربط المشروع مع Vercel

1. سجّل الدخول إلى لوحة Vercel:  
   https://vercel.com

2. من الشاشة الرئيسية اختر: **Add New Project**.

3. اختر: **Import Git Repository**.

4. اختر مستودع GitHub الذي يحتوي على مشروعك (مثلاً `dopamine-crm-pwa`).

5. إعدادات الإطار (Framework):
   - Vercel سيتعرّف تلقائياً على **Next.js**، لا تعدّل شيئاً هنا.

6. إعدادات مسار المشروع:
   - **Root Directory** = `.` (جذر المستودع، لا توجد مجلدات فرعية للمشروع).
   - **Build Command** = `npm run build`
   - **Output Directory** = `.next`

7. إعداد متغيرات البيئة (Environment Variables):
   - من تبويب **Environment Variables** أضف المتغيرات التالية:

   - المتغير الأساسي الآن:
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`  
       القيمة = نفس المفتاح الموجود في ملف `.env.local` على جهازك.

   - (اختياري، للمرحلة القادمة – Firebase):
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`

   - يمكنك أخذ الأسماء والقيم النموذجية من ملف `.env.example` الموجود في المشروع.

8. اضغط على **Deploy** لبدء أول نشر.

---

## 4 – أول نشر (First Deploy)

- بعد الضغط على **Deploy**:
  - Vercel سيقوم تلقائياً بتشغيل:
    - `npm install`
    - `npm run build`
  - إذا نجح الـ build بدون أخطاء، سيظهر لك رابط (Domain) مثل:

    ```text
    https://dopamine-crm-pwa.vercel.app
    ```

- يمكنك فتح هذا الرابط من أي متصفح (موبايل أو لابتوب) وتجربة الشاشات:
  - `/field-visit` → لتسجيل زيارة ميدانية جديدة مع GPS وتايمر.
  - `/visits` → لمشاهدة سجل الزيارات المخزَّنة في الذاكرة (in-memory).
  - `/reps-map` → لمشاهدة خريطة OpenStreetMap مع نقاط البداية والنهاية لكل زيارة تحتوي على GPS.

- إذا فشل الـ build:
  - Vercel يعرض لك الـ logs بالتفصيل.
  - يمكنك إصلاح المشكلة محلياً (ثم commit + push) وسيحاول Vercel النشر مرة أخرى.

---

## 5 – التحديثات اللاحقة بعد النشر

بعد أول نشر، أي تعديل تعمله في الكود وتتأكد أنه يعمل محلياً يمكن إرساله إلى Vercel عن طريق Git فقط:

1. نفّذ من داخل مجلد المشروع:

   ```bash
   git add .
   git commit -m "Update"
   git push
   ```

2. بعد `git push` إلى الفرع `main` (أو الفرع الذي ربطته في Vercel):
   - Vercel سيبدأ **Deploy جديد تلقائياً**.
   - بعد نجاحه، نفس الرابط (Domain) سيتم تحديثه بالكود الجديد.

---

## 6 – ملاحظات سريعة

- المشروع حالياً يعمل **بدون قاعدة بيانات حقيقية** (in-memory API):
  - يعني أن الزيارات تُمسح عند إعادة تشغيل السيرفر أو بعد إعادة نشر المشروع.
  - في المراحل القادمة يمكن ربطه مع MongoDB (Atlas) وإضافة متغير `MONGODB_URI` في Vercel.

- للتجربة محلياً قبل أي push:
  - `npm install`
  - `npm run dev`
  - افتح `http://localhost:3000`

- إذا أردت تعطيل أو تغيير Google Maps في المستقبل:
  - المتغير `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` يمكن تعديله أو حذفه من Vercel ومن `.env.local`.

