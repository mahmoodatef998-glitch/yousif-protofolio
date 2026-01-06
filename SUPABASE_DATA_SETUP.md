# Supabase Data Setup Guide

## خطوات إضافة البيانات في Supabase

### 1. افتح Supabase Dashboard
- اذهب إلى: https://supabase.com/dashboard
- اختر مشروعك

### 2. افتح SQL Editor
- من القائمة الجانبية، اضغط على "SQL Editor"
- اضغط على "New Query"

### 3. شغل ملف Schema
- انسخ محتوى `supabase/schema.sql`
- الصقه في SQL Editor
- اضغط "Run" أو F5

### 4. شغل ملف Seed (للبيانات التجريبية)
- انسخ محتوى `supabase/seed.sql`
- الصقه في SQL Editor
- اضغط "Run" أو F5

### 5. تحقق من البيانات
- اذهب إلى "Table Editor"
- افتح جدول `sections` - يجب أن ترى 7 sections
- افتح جدول `content_items` - يجب أن ترى صور وفيديوهات تجريبية

## ملاحظات مهمة:

1. **إذا لم تظهر الصور:**
   - تأكد من أن `sections` موجودة في قاعدة البيانات
   - تأكد من أن `content_items` مرتبطة بـ `section_id` الصحيح
   - افتح Console في المتصفح (F12) وابحث عن رسائل `console.log` لمعرفة المشكلة

2. **لإضافة صور جديدة:**
   - استخدم Admin Dashboard (`/admin`)
   - اذهب إلى "Upload Content"
   - ارفع الصورة واختر الـ section
   - الصورة ستظهر تلقائياً في الصفحة الرئيسية

3. **للتأكد من أن API يعمل:**
   - افتح: `http://localhost:3000/api/content?section=wedding`
   - يجب أن ترى JSON مع البيانات

## استكشاف الأخطاء:

### المشكلة: لا تظهر الصور
**الحل:**
1. افتح Browser Console (F12)
2. ابحث عن رسائل `console.log` مثل:
   - "Wedding images fetched:"
   - "No wedding images found in database"
3. إذا رأيت "No images found" → البيانات غير موجودة في Supabase
4. شغل `seed.sql` مرة أخرى

### المشكلة: API يعيد empty array
**الحل:**
1. تأكد من أن Sections موجودة:
   ```sql
   SELECT * FROM sections;
   ```
2. تأكد من أن Content Items موجودة:
   ```sql
   SELECT * FROM content_items;
   ```
3. تأكد من أن `section_id` في `content_items` يطابق `id` في `sections`

### المشكلة: الصور لا تظهر بعد الرفع
**الحل:**
1. تأكد من أن الرفع نجح (تحقق من Console)
2. انتظر 30 ثانية (Auto-refresh)
3. أو افتح الصفحة الرئيسية في tab منفصل وستحدث فوراً (BroadcastChannel)

