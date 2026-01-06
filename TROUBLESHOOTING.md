# Troubleshooting Guide

## مشكلة صور Unsplash (404 Error)

### المشكلة:
```
GET /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2F... 404 (Not Found)
```

### الحل:
تم استبدال `Image` component من Next.js بـ `img` tag مباشرة للصور من Unsplash في:
- `components/Reels.tsx`
- `components/Wedding.tsx`
- `components/Product.tsx`
- `components/Restaurant.tsx`
- `components/About.tsx`

### السبب:
Next.js Image Optimization لا يعمل بشكل صحيح مع Unsplash URLs في Vercel بسبب CORS أو مشاكل في الـ optimization.

---

## مشكلة Admin Dashboard لا يفتح

### التحقق من:

1. **Environment Variables في Vercel:**
   تأكد من إضافة هذه المتغيرات في Vercel Dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://lybpxzruyjphnaffnvuy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4H5_eqpm52vYNibTCw48Ag_emEFeaq2
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_Pcl55RhwiTCroFJo2a8luQ_G6DyUk0F
   ```

2. **Database Setup:**
   - افتح Supabase Dashboard
   - اذهب إلى SQL Editor
   - انسخ محتوى `supabase/schema.sql`
   - الصق واضغط Run

3. **Create Admin User:**
   - Authentication > Users
   - Add User > Create new user
   - أدخل Email و Password

4. **Test Login:**
   - افتح `/admin/login`
   - سجل دخول بالبيانات اللي أنشأتها

### إذا استمرت المشكلة:

1. **تحقق من Console:**
   - افتح Developer Tools (F12)
   - اذهب إلى Console
   - ابحث عن أخطاء Supabase

2. **تحقق من Network:**
   - افتح Developer Tools (F12)
   - اذهب إلى Network
   - حاول تسجيل الدخول
   - تحقق من requests إلى Supabase

3. **تحقق من Vercel Logs:**
   - اذهب إلى Vercel Dashboard
   - افتح المشروع
   - اذهب إلى Logs
   - ابحث عن أخطاء

---

## مشاكل أخرى محتملة

### Favicon 404:
- تم إضافة `app/icon.svg` - Next.js 14 يتعامل معه تلقائياً
- بعد إعادة البناء على Vercel، يجب أن يظهر Favicon

### Vercel Analytics Errors:
- أخطاء `instrument.js` من Vercel Analytics
- لا تؤثر على عمل الموقع
- يمكن تجاهلها أو تعطيل Vercel Analytics من Dashboard

---

## خطوات إصلاح سريعة

1. **Push التعديلات:**
   ```bash
   git add .
   git commit -m "Fix images and admin dashboard"
   git push origin main
   ```

2. **في Vercel:**
   - انتظر إعادة البناء التلقائي
   - أو اضغط "Redeploy" يدوياً

3. **تحقق من Environment Variables:**
   - Settings > Environment Variables
   - تأكد من وجود جميع المتغيرات

4. **Test:**
   - افتح الموقع
   - تحقق من الصور
   - جرب `/admin/login`

