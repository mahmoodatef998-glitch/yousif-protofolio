-- =====================================================
-- إصلاح البيانات التي لا تحتوي على media_url
-- شغّل هذا في Supabase SQL Editor
-- =====================================================

-- =====================================================
-- الجزء 1: التحقق من البيانات
-- =====================================================

-- عرض البيانات التي لا تحتوي على media_url
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
WHERE ci.media_url IS NULL OR ci.media_url = ''
ORDER BY ci.created_at DESC;

-- =====================================================
-- الجزء 2: إصلاح البيانات (إضافة media_url للبيانات القديمة)
-- =====================================================

-- تحديث البيانات التي لا تحتوي على media_url
-- هذا سيضيف URLs للبيانات القديمة بناءً على العنوان
UPDATE content_items 
SET 
    media_url = CASE 
        -- Wedding
        WHEN title LIKE '%Wedding%' OR title LIKE '%Bridal%' OR title LIKE '%Reception%' OR title LIKE '%Ceremony%' THEN 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                ELSE 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
            END
        -- Product
        WHEN title LIKE '%Product%' THEN 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                ELSE 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
            END
        -- Restaurant
        WHEN title LIKE '%Restaurant%' THEN 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
                ELSE 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
            END
        -- Videos
        WHEN title LIKE '%Portrait%' OR title LIKE '%Highlights%' THEN 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
                ELSE 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80'
            END
        -- Reels
        WHEN title LIKE '%Reel%' THEN 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
                ELSE 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80'
            END
        -- Default
        ELSE 
            CASE 
                WHEN media_type = 'video' THEN 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                ELSE 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
            END
    END,
    thumbnail_url = CASE 
        -- Wedding
        WHEN title LIKE '%Wedding%' OR title LIKE '%Bridal%' OR title LIKE '%Reception%' OR title LIKE '%Ceremony%' THEN 
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
        -- Product
        WHEN title LIKE '%Product%' THEN 
            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80'
        -- Restaurant
        WHEN title LIKE '%Restaurant%' THEN 
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'
        -- Videos
        WHEN title LIKE '%Portrait%' OR title LIKE '%Highlights%' THEN 
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80'
        -- Reels
        WHEN title LIKE '%Reel%' THEN 
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80'
        -- Default
        ELSE 
            'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80'
    END
WHERE (media_url IS NULL OR media_url = '')
AND is_active = true;

-- =====================================================
-- الجزء 3: التحقق من النتيجة
-- =====================================================

-- عرض البيانات بعد الإصلاح
SELECT 
    ci.id,
    ci.title,
    ci.media_type,
    ci.media_url,
    ci.thumbnail_url,
    ci.is_active,
    s.name as section_name
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
WHERE ci.is_active = true
ORDER BY s.display_order, ci.order_index;

-- إحصائيات
SELECT 
    s.name as section_name,
    COUNT(ci.id) as total_items,
    COUNT(ci.id) FILTER (WHERE ci.media_url IS NOT NULL AND ci.media_url != '') as items_with_url,
    COUNT(ci.id) FILTER (WHERE ci.media_url IS NULL OR ci.media_url = '') as items_without_url
FROM sections s
LEFT JOIN content_items ci ON s.id = ci.section_id AND ci.is_active = true
GROUP BY s.name, s.display_order
ORDER BY s.display_order;

