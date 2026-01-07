-- Script لإصلاح البيانات القديمة
-- ⚠️ احذر: هذا سيحدث جميع البيانات التي is_active = null أو false
-- قم بتشغيل هذا في Supabase SQL Editor فقط إذا كنت متأكداً

-- 1. عرض البيانات التي تحتاج إصلاح
SELECT 
    id,
    title,
    media_type,
    is_active,
    created_at
FROM content_items
WHERE is_active IS NULL OR is_active = false
ORDER BY created_at DESC;

-- 2. إصلاح البيانات (تعيين is_active = true للبيانات القديمة)
-- قم بإلغاء التعليق من السطر التالي لتطبيق الإصلاح:
-- UPDATE content_items 
-- SET is_active = true 
-- WHERE is_active IS NULL OR is_active = false;

-- 3. التحقق من النتيجة
SELECT 
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE is_active = true) as active_items,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_items,
    COUNT(*) FILTER (WHERE is_active IS NULL) as null_items
FROM content_items;

-- 4. عرض البيانات بعد الإصلاح (عينة)
SELECT 
    ci.id,
    ci.title,
    ci.media_type,
    ci.is_active,
    s.name as section_name,
    ci.created_at
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
WHERE ci.is_active = true
ORDER BY ci.created_at DESC
LIMIT 20;

