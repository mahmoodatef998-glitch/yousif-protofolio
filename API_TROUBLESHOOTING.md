# API Troubleshooting Guide

## مشكلة: Connection Failed عند فتح `/api/content?section=wedding`

### الحلول المحتملة:

### 1. تحقق من Environment Variables
تأكد من أن ملف `.env.local` يحتوي على:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lybpxzruyjphnaffnvuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4H5_eqpm52vYNibTCw48Ag_emEFeaq2
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Pcl55RhwiTCroFJo2a8luQ_G6DyUk0F
```

**ملاحظة:** بعد إضافة أو تعديل `.env.local`، يجب إعادة تشغيل السيرفر:
```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### 2. تحقق من Supabase Database
تأكد من أن:
- Schema تم تشغيله (`supabase/schema.sql`)
- Seed data تم تشغيله (`supabase/seed.sql`)
- Tables موجودة: `sections`, `content_items`

**للتحقق:**
1. افتح Supabase Dashboard
2. اذهب إلى "Table Editor"
3. تأكد من وجود الجداول والبيانات

### 3. تحقق من RLS Policies
تأكد من أن Row Level Security (RLS) policies موجودة:
- يجب أن يكون هناك policy للـ public read access
- افتح SQL Editor وشغل:
```sql
SELECT * FROM pg_policies WHERE tablename = 'content_items';
```

### 4. تحقق من Console Logs
افتح Terminal حيث يعمل `npm run dev` وابحث عن:
- `Error fetching content:`
- `Section 'wedding' not found:`
- أي رسائل خطأ أخرى

### 5. اختبر API مباشرة
افتح Browser Console (F12) وشغل:
```javascript
fetch('/api/content?section=wedding')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 6. تحقق من Network Tab
1. افتح Browser DevTools (F12)
2. اذهب إلى "Network" tab
3. افتح `/api/content?section=wedding`
4. انظر إلى Response - يجب أن ترى JSON أو رسالة خطأ واضحة

### 7. إعادة تشغيل السيرفر
إذا لم يعمل شيء:
```bash
# أوقف السيرفر
Ctrl+C

# احذف .next folder
rm -rf .next  # أو del .next في Windows

# أعد تشغيل السيرفر
npm run dev
```

### 8. تحقق من Supabase Connection
اختبر الاتصال مباشرة من Supabase Dashboard:
1. افتح Supabase Dashboard
2. اذهب إلى "SQL Editor"
3. شغل:
```sql
SELECT * FROM sections WHERE name = 'wedding';
SELECT * FROM content_items;
```

إذا لم تعمل هذه الاستعلامات، المشكلة في Supabase وليس في الكود.

## رسائل الخطأ الشائعة:

### "Supabase configuration missing"
**الحل:** أضف environment variables في `.env.local`

### "Section 'wedding' not found"
**الحل:** شغل `supabase/seed.sql` في Supabase

### "Failed to fetch content from Supabase"
**الحل:** 
1. تحقق من RLS policies
2. تحقق من أن Supabase URL و Key صحيحة
3. تأكد من أن Tables موجودة

### "Connection failed" أو "Network error"
**الحل:**
1. تأكد من أن السيرفر يعمل (`npm run dev`)
2. تحقق من أن Port 3000 متاح
3. جرب إعادة تشغيل السيرفر

