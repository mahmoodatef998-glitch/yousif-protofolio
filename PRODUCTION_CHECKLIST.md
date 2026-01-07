# Production Deployment Checklist

## ✅ التغييرات المرفوعة على GitHub
- ✅ إصلاح API `/api/about` - معالجة أخطاء محسنة
- ✅ إصلاح رفع الملفات - استخدام fetch بدلاً من XMLHttpRequest
- ✅ إضافة التحقق من متغيرات البيئة
- ✅ تحسين logging ورسائل الخطأ

## 🔧 متغيرات البيئة المطلوبة في Vercel/Production

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Cloudinary
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_FOLDER=portfolio
```

### Optional
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_id
```

## 📋 خطوات النشر على Vercel

1. **ربط المشروع:**
   - اذهب إلى [Vercel Dashboard](https://vercel.com)
   - Import Project من GitHub
   - اختر المشروع

2. **إضافة Environment Variables:**
   - Settings > Environment Variables
   - أضف جميع المتغيرات المذكورة أعلاه
   - تأكد من تحديد Production, Preview, Development

3. **Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (افتراضي)

4. **Deploy:**
   - اضغط Deploy
   - انتظر حتى يكتمل البناء

## 🧪 اختبار بعد النشر

### 1. اختبار API `/api/about`
- افتح: `https://yourdomain.com/api/about`
- يجب أن يعيد JSON بدون أخطاء

### 2. اختبار رفع الملفات
- افتح Admin Dashboard: `https://yourdomain.com/admin`
- سجل دخول
- ارفع صورة أو فيديو
- افتح Developer Tools > Network Tab
- يجب أن ترى:
  - `POST /api/cloudinary/upload` ✅
  - `POST /api/content` ✅

### 3. اختبار الصفحات
- الصفحة الرئيسية
- صفحة About
- صفحة Portfolio
- صفحة Contact

## 🐛 إذا واجهت مشاكل

### خطأ 500 في `/api/about`
1. تحقق من Environment Variables في Vercel
2. تحقق من Supabase Database - تأكد من وجود جدول `about_content`
3. تحقق من Vercel Logs للتفاصيل

### رفع الملفات لا يعمل
1. تحقق من Cloudinary Environment Variables
2. تحقق من Network Tab في المتصفح
3. تحقق من Console للأخطاء
4. تحقق من Vercel Logs

### Database Errors
1. تأكد من تشغيل `supabase/schema.sql` في Supabase
2. تحقق من RLS Policies
3. تحقق من أن الجداول موجودة

## 📝 ملاحظات

- خطأ `vercel.live/_next-live/feedback/feedback.js` يمكن تجاهله - لا يؤثر على الموقع
- جميع الطلبات الآن تظهر في Network Tab
- تم تحسين رسائل الخطأ لتكون أكثر وضوحاً

