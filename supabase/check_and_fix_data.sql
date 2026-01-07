-- =====================================================
-- SQL للتحقق من البيانات وإصلاحها
-- شغّل هذا في Supabase SQL Editor
-- =====================================================

-- =====================================================
-- الجزء 1: التحقق من البيانات الموجودة
-- =====================================================

-- عرض جميع البيانات مع media_url
SELECT 
    ci.id,
    ci.title,
    ci.media_type,
    ci.media_url,
    ci.is_active,
    s.name as section_name,
    ci.created_at
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
ORDER BY ci.created_at DESC;

-- التحقق من البيانات التي لا تحتوي على media_url
SELECT 
    ci.id,
    ci.title,
    ci.media_type,
    ci.media_url,
    ci.is_active,
    s.name as section_name
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
WHERE ci.media_url IS NULL OR ci.media_url = ''
ORDER BY ci.created_at DESC;

-- إحصائيات
SELECT 
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE media_url IS NOT NULL AND media_url != '') as items_with_url,
    COUNT(*) FILTER (WHERE media_url IS NULL OR media_url = '') as items_without_url,
    COUNT(*) FILTER (WHERE is_active = true) as active_items,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_items
FROM content_items;

-- =====================================================
-- الجزء 2: إصلاح البيانات (إذا كانت media_url فارغة)
-- =====================================================

-- ⚠️ هذا سيحدث البيانات التي media_url فارغة
-- قم بإلغاء التعليق فقط إذا كنت تريد إصلاح البيانات

-- حذف البيانات التي لا تحتوي على media_url (إذا كانت demo data)
-- DELETE FROM content_items 
-- WHERE (media_url IS NULL OR media_url = '') 
-- AND created_at < NOW() - INTERVAL '1 day';

-- أو تحديث البيانات القديمة بـ URLs جديدة (إذا كانت demo)
-- UPDATE content_items 
-- SET media_url = CASE 
--     WHEN title LIKE '%Wedding%' THEN 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
--     WHEN title LIKE '%Product%' THEN 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
--     WHEN title LIKE '%Restaurant%' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
--     ELSE media_url
-- END,
-- thumbnail_url = CASE 
--     WHEN title LIKE '%Wedding%' THEN 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
--     WHEN title LIKE '%Product%' THEN 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
--     WHEN title LIKE '%Restaurant%' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
--     ELSE thumbnail_url
-- END
-- WHERE (media_url IS NULL OR media_url = '') 
-- AND created_at < NOW() - INTERVAL '1 day';

-- =====================================================
-- الجزء 3: التحقق من Sections
-- =====================================================

-- عرض جميع Sections
SELECT id, name, title, type, is_active, display_order
FROM sections
ORDER BY display_order;

-- التحقق من أن جميع Sections موجودة
SELECT 
    CASE 
        WHEN COUNT(*) = 7 THEN '✅ All sections exist'
        ELSE '❌ Missing sections: ' || (7 - COUNT(*))::text
    END as status,
    COUNT(*) as section_count,
    string_agg(name, ', ') as section_names
FROM sections
WHERE name IN ('about', 'videos', 'reels', 'wedding', 'product', 'restaurant', 'contact');

-- =====================================================
-- الجزء 4: التحقق من RLS Policies
-- =====================================================

-- عرض Policies لـ content_items
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'content_items'
ORDER BY policyname;

-- عرض Policies لـ sections
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sections'
ORDER BY policyname;

-- =====================================================
-- الجزء 5: اختبار القراءة العامة (Public Read)
-- =====================================================

-- محاولة قراءة البيانات كـ anonymous user
-- هذا يجب أن يعمل إذا كانت RLS Policies صحيحة
SELECT 
    ci.id,
    ci.title,
    ci.media_url,
    ci.is_active,
    s.name as section_name
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
WHERE ci.is_active = true
ORDER BY ci.created_at DESC
LIMIT 10;

-- =====================================================
-- الجزء 6: إصلاح شامل (إذا لزم الأمر)
-- =====================================================

-- تأكد من أن جميع البيانات is_active = true
UPDATE content_items 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- تأكد من أن جميع Sections is_active = true
UPDATE sections 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- =====================================================
-- الجزء 7: النتيجة النهائية
-- =====================================================

-- عرض البيانات النهائية (للتحقق)
SELECT 
    s.name as section_name,
    COUNT(ci.id) as item_count,
    COUNT(ci.id) FILTER (WHERE ci.is_active = true) as active_count,
    COUNT(ci.id) FILTER (WHERE ci.media_url IS NOT NULL AND ci.media_url != '') as items_with_url
FROM sections s
LEFT JOIN content_items ci ON s.id = ci.section_id
GROUP BY s.name, s.display_order
ORDER BY s.display_order;

