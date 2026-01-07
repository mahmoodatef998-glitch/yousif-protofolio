# إصلاح مشكلة About Section - Schema Cache

## 🔍 المشكلة المستمرة

بعد تشغيل SQL script، لا تزال المشكلة موجودة:
```
Could not find the 'bio_text' column of 'about_content' in the schema cache
Error Code: PGRST204
```

## 🎯 السبب المحتمل

Supabase PostgREST يحتفظ بـ **Schema Cache** في الذاكرة. حتى بعد إضافة الأعمدة، قد يحتاج إلى إعادة بناء الـ cache.

## ✅ الحلول (جرب بالترتيب)

### الحل 1: إعادة إنشاء الجدول بالكامل (موصى به)

1. اذهب إلى **Supabase Dashboard** → **SQL Editor**
2. شغّل الملف: `supabase/recreate_about_content_table.sql`
   - ⚠️ **تحذير**: هذا سيحذف جميع البيانات الموجودة في `about_content`
   - إذا كان لديك بيانات مهمة، احفظها أولاً
3. بعد التشغيل، انتظر 10-30 ثانية
4. جرب حفظ بيانات About section مرة أخرى

### الحل 2: إعادة بناء Schema Cache يدوياً

إذا كان الحل 1 لم يعمل:

1. اذهب إلى **Supabase Dashboard** → **Settings** → **API**
2. ابحث عن **"Reload Schema"** أو **"Refresh Schema Cache"**
3. اضغط على الزر لإعادة بناء الـ cache
4. انتظر 30-60 ثانية
5. جرب مرة أخرى

### الحل 3: إعادة تشغيل Supabase Project

1. اذهب إلى **Supabase Dashboard** → **Settings** → **General**
2. اضغط على **"Restart Project"** أو **"Pause/Resume"**
3. انتظر حتى يعود المشروع للعمل (2-5 دقائق)
4. جرب مرة أخرى

### الحل 4: التحقق من الأعمدة يدوياً

1. اذهب إلى **Supabase Dashboard** → **Table Editor**
2. اختر جدول `about_content`
3. تحقق من وجود الأعمدة التالية:
   - ✅ `id`
   - ✅ `hero_title`
   - ✅ `hero_subtitle`
   - ✅ `bio_text` ← **هذا هو المهم**
   - ✅ `profile_image_url`
   - ✅ `stats`
   - ✅ `created_at`
   - ✅ `updated_at`

إذا كان `bio_text` غير موجود:
- شغّل `supabase/recreate_about_content_table.sql` مرة أخرى

## 🔧 حل بديل: استخدام أسماء أعمدة مختلفة مؤقتاً

إذا استمرت المشكلة، يمكننا تعديل الكود لاستخدام أسماء أعمدة مختلفة. لكن هذا يتطلب تغييرات في الكود.

## 📝 ملاحظات مهمة

1. **Schema Cache**: Supabase PostgREST يخزن الـ schema في الذاكرة لتحسين الأداء. عند تغيير الـ schema، قد يحتاج إلى وقت لإعادة البناء.

2. **الانتظار**: بعد أي تغيير في الـ schema، انتظر 30-60 ثانية قبل المحاولة مرة أخرى.

3. **التحقق**: استخدم SQL Editor للتحقق من أن الأعمدة موجودة فعلاً:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'about_content';
   ```

## 🆘 إذا استمرت المشكلة

إذا جربت جميع الحلول أعلاه ولا تزال المشكلة موجودة:
1. تأكد من أنك تستخدم المشروع الصحيح في Supabase
2. تحقق من أن Environment Variables في Vercel صحيحة
3. راجع Logs في Supabase Dashboard → Logs → Postgres Logs

