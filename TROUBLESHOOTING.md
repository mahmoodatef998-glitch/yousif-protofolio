# دليل حل المشاكل - الصور لا تظهر

## المشكلة
البيانات موجودة في Database وكلها تحتوي على `media_url`، لكن الصور لا تظهر على الموقع.

## خطوات التشخيص

### 1. التحقق من API Response

افتح Browser Console (F12) وتحقق من:

#### أ. Network Tab
- افتح Network Tab
- ابحث عن `/api/content?section=product` (أو أي section)
- تحقق من:
  - Status Code: يجب أن يكون `200`
  - Response: يجب أن يحتوي على `data` array
  - كل item في `data` يجب أن يحتوي على `media_url`

#### ب. Console Logs
ابحث عن هذه الرسائل:
- `🔍 Fetching product images...`
- `📦 Raw API response:`
- `✅ Product images formatted:`
- `❌ Image failed to load:` (إذا كانت الصور لا تحمل)

### 2. اختبار API مباشرة

افتح في المتصفح:
```
https://your-domain.vercel.app/api/test-content?section=product
```

يجب أن ترى:
```json
{
  "success": true,
  "section": {
    "id": "...",
    "name": "product",
    "is_active": true
  },
  "content": {
    "total": 6,
    "items_with_url": 6,
    "items_without_url": 0,
    "items": [...]
  }
}
```

### 3. التحقق من الصور مباشرة

افتح `media_url` مباشرة في المتصفح:
```
https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80
```

إذا لم تفتح الصورة:
- المشكلة في الصور نفسها (CORS أو محظورة)
- يجب استخدام صور من Cloudinary بدلاً من Unsplash

### 4. التحقق من RLS Policies

شغّل في Supabase SQL Editor:
```sql
-- التحقق من Policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'content_items'
ORDER BY policyname;
```

يجب أن ترى:
- `Allow public read access to content_items` (FOR SELECT)
- `Allow authenticated users full access to content_items` (FOR ALL)

### 5. التحقق من Environment Variables

في Vercel Dashboard:
- Settings > Environment Variables
- تأكد من وجود:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. التحقق من Console Errors

ابحث في Browser Console عن:
- `CORS` errors
- `Failed to load resource`
- `Image failed to load`

## الحلول المحتملة

### الحل 1: استخدام Cloudinary بدلاً من Unsplash

إذا كانت الصور من Unsplash لا تعمل:
1. ارفع الصور إلى Cloudinary من Admin Dashboard
2. أو استبدل URLs في Database بـ Cloudinary URLs

### الحل 2: إصلاح RLS Policies

شغّل في Supabase SQL Editor:
```sql
-- إعادة إنشاء Policy للقراءة العامة
DROP POLICY IF EXISTS "Allow public read access to content_items" ON content_items;
CREATE POLICY "Allow public read access to content_items"
ON content_items FOR SELECT
USING (is_active = true);
```

### الحل 3: التحقق من CORS

إذا كانت هناك مشاكل CORS:
- تأكد من أن Supabase URL صحيح
- تأكد من أن `NEXT_PUBLIC_SUPABASE_ANON_KEY` صحيح

### الحل 4: إعادة بناء المشروع

```bash
# في Vercel
# Settings > General > Clear Build Cache
# ثم إعادة Deploy
```

## اختبار سريع

1. افتح Browser Console (F12)
2. افتح Network Tab
3. أعد تحميل الصفحة
4. ابحث عن `/api/content?section=product`
5. افتح Response وتحقق من البيانات
6. افتح Console Tab وابحث عن رسائل الخطأ

## إذا لم تحل المشكلة

أرسل:
1. Screenshot من Network Tab (للـ API request)
2. Screenshot من Console Tab (للأخطاء)
3. Response من `/api/test-content?section=product`
4. Response من `/api/debug`
