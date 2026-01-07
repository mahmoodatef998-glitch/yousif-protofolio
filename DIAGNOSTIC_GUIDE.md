# دليل تشخيص المشكلة - لماذا الصور لا تظهر؟

## 🔍 خطوات التشخيص

### الخطوة 1: التحقق من Environment Variables في Vercel

1. اذهب إلى Vercel Dashboard > Project > Settings > Environment Variables
2. تأكد من وجود:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. تأكد من أنهم في **Production** environment
4. إذا غيرتهم، أعد نشر المشروع

### الخطوة 2: اختبار الاتصال بـ Supabase

افتح في المتصفح:
```
https://your-vercel-url.vercel.app/api/test
```

يجب أن ترى:
- `status: 'success'` ✅
- `sectionsFound: 7` (أو أكثر) ✅

إذا رأيت `error`:
- تحقق من Environment Variables
- تحقق من Supabase URL و Key

### الخطوة 3: التحقق من Database

1. افتح Supabase Dashboard
2. اذهب إلى **Table Editor**
3. تحقق من:
   - جدول `sections` موجود وبه 7 rows ✅
   - جدول `content_items` موجود ✅

4. افتح جدول `content_items`:
   - هل يوجد بيانات؟ ✅
   - هل `is_active` = `true`؟ ✅
   - هل `media_url` موجود وليس فارغ؟ ✅

### الخطوة 4: التحقق من RLS Policies

1. اذهب إلى **Authentication** > **Policies**
2. تحقق من وجود هذه Policies:

**لـ content_items:**
- ✅ "Allow authenticated users full access to content_items"
- ✅ "Allow public read access to content_items" (USING is_active = true)

**لـ sections:**
- ✅ "Allow authenticated users full access to sections"
- ✅ "Allow public read access to sections" (USING is_active = true)

### الخطوة 5: اختبار API مباشرة

افتح في المتصفح:
```
https://your-vercel-url.vercel.app/api/content?section=product
```

يجب أن ترى:
```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "media_url": "https://...",
      "is_active": true,
      ...
    }
  ]
}
```

إذا رأيت `data: []`:
- البيانات غير موجودة في Database
- أو RLS Policy تمنع القراءة

### الخطوة 6: التحقق من Console Logs

1. افتح الصفحة الرئيسية
2. افتح Developer Tools > Console
3. ابحث عن:
   - `Product images fetched: [...]` ✅
   - `Product images formatted: [...]` ✅

إذا رأيت:
- `No product images found in database` ❌
- `Failed to fetch product images` ❌
- `Error fetching product images` ❌

### الخطوة 7: التحقق من Network Tab

1. افتح Developer Tools > Network
2. ابحث عن `GET /api/content?section=product`
3. افتح Response:
   - Status: 200 ✅
   - Response body: يحتوي على `data: [...]` ✅

إذا رأيت:
- Status: 500 ❌ → تحقق من Vercel Logs
- Status: 404 ❌ → تحقق من Route
- Response: `{error: ...}` ❌ → تحقق من Error message

## 🎯 الأسباب المحتملة والحلول

### السبب 1: لم يتم تشغيل SQL في Supabase
**الحل:**
1. افتح Supabase SQL Editor
2. شغّل `supabase/complete_setup.sql`
3. تحقق من أن الجداول موجودة

### السبب 2: RLS Policies غير موجودة أو خاطئة
**الحل:**
1. شغّل `supabase/complete_setup.sql` مرة أخرى
2. أو شغّل الجزء الخاص بـ Policies فقط

### السبب 3: Environment Variables غير صحيحة في Vercel
**الحل:**
1. تحقق من Vercel Environment Variables
2. تأكد من أنهم في Production
3. أعد نشر المشروع

### السبب 4: البيانات غير موجودة أو is_active = false
**الحل:**
1. شغّل `supabase/fix_existing_data.sql`
2. أو أزل التعليق من:
   ```sql
   UPDATE content_items 
   SET is_active = true 
   WHERE is_active IS NULL OR is_active = false;
   ```

### السبب 5: Sections غير موجودة
**الحل:**
1. شغّل `supabase/complete_setup.sql`
2. تحقق من جدول `sections` في Table Editor

## 🚨 إذا استمرت المشكلة

### تحقق من Vercel Logs
1. اذهب إلى Vercel Dashboard > Project > Logs
2. ابحث عن أخطاء Supabase
3. ابحث عن `Error fetching content`

### تحقق من Supabase Logs
1. اذهب إلى Supabase Dashboard > Logs
2. ابحث عن أخطاء RLS
3. ابحث عن `policy violation`

## ✅ Checklist سريع

- [ ] Environment Variables موجودة في Vercel
- [ ] `/api/test` يعيد `success`
- [ ] جدول `sections` موجود وبه 7 rows
- [ ] جدول `content_items` موجود وبه بيانات
- [ ] `is_active = true` في جميع البيانات
- [ ] RLS Policies موجودة وصحيحة
- [ ] `/api/content?section=product` يعيد بيانات
- [ ] Console لا يظهر أخطاء
- [ ] Network Tab يظهر 200 status

## 📞 إذا لم تحل المشكلة

أرسل:
1. نتيجة `/api/test`
2. نتيجة `/api/content?section=product`
3. Console Logs
4. Vercel Logs (أول 10 أخطاء)

