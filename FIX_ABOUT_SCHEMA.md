# إصلاح مشكلة About Section - Schema Error

## 🔍 المشكلة

عند محاولة حفظ بيانات في About section، يظهر الخطأ التالي:
```
Could not find the 'bio_text' column of 'about_content' in the schema cache
Error Code: PGRST204
```

## 🎯 السبب

جدول `about_content` في قاعدة البيانات Supabase لا يحتوي على جميع الأعمدة المطلوبة. يبدو أن الجدول تم إنشاؤه بدون بعض الأعمدة أو تم تعديله.

## ✅ الحل

### الخطوة 1: فتح Supabase SQL Editor

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى **SQL Editor** من القائمة الجانبية

### الخطوة 2: تشغيل SQL Script

انسخ محتوى الملف `supabase/fix_about_content_schema.sql` والصقه في SQL Editor، ثم اضغط **Run**.

هذا السكريبت سيقوم بـ:
- التحقق من وجود كل عمود مطلوب
- إضافة الأعمدة المفقودة تلقائياً
- إنشاء الجدول إذا لم يكن موجوداً

### الخطوة 3: التحقق من النتيجة

بعد تشغيل السكريبت، يجب أن ترى قائمة بالأعمدة في الجدول:
- `id`
- `hero_title`
- `hero_subtitle`
- `bio_text` ✅ (هذا هو العمود المفقود)
- `profile_image_url`
- `stats`
- `created_at`
- `updated_at`

### الخطوة 4: إعادة المحاولة

بعد إصلاح الـ schema، جرب حفظ بيانات About section مرة أخرى. يجب أن تعمل الآن بدون مشاكل.

## 📝 ملاحظات

- إذا استمرت المشكلة، تأكد من أن RLS policies مفعلة بشكل صحيح
- يمكنك أيضاً تشغيل `supabase/complete_setup.sql` لإعادة إنشاء جميع الجداول من الصفر (⚠️ سيحذف البيانات الموجودة)

## 🔗 الملفات ذات الصلة

- `supabase/fix_about_content_schema.sql` - SQL script لإصلاح الـ schema
- `supabase/complete_setup.sql` - إعداد كامل للقاعدة (يشمل جميع الجداول)
- `app/api/about/route.ts` - API route لـ About section

