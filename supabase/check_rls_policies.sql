-- Script للتحقق من RLS Policies
-- قم بتشغيل هذا في Supabase SQL Editor للتحقق من أن Policies موجودة وصحيحة

-- 1. التحقق من أن RLS مفعل
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('sections', 'content_items', 'about_content', 'contact_info', 'site_settings');

-- 2. عرض جميع Policies لـ content_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'content_items'
ORDER BY policyname;

-- 3. عرض جميع Policies لـ sections
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'sections'
ORDER BY policyname;

-- 4. التحقق من البيانات الموجودة
SELECT 
    ci.id,
    ci.title,
    ci.media_type,
    ci.is_active,
    ci.section_id,
    s.name as section_name
FROM content_items ci
LEFT JOIN sections s ON ci.section_id = s.id
ORDER BY ci.created_at DESC
LIMIT 10;

-- 5. التحقق من Sections الموجودة
SELECT id, name, is_active, type
FROM sections
ORDER BY display_order;

-- 6. إصلاح البيانات القديمة (إذا كان is_active = null أو false)
-- ⚠️ احذر: هذا سيحدث جميع البيانات القديمة
-- UPDATE content_items 
-- SET is_active = true 
-- WHERE is_active IS NULL OR is_active = false;

-- 7. إنشاء/إعادة إنشاء Policy للقراءة العامة (إذا كانت مفقودة)
-- DROP POLICY IF EXISTS "Allow public read access to content_items" ON content_items;
-- CREATE POLICY "Allow public read access to content_items"
-- ON content_items FOR SELECT
-- USING (is_active = true);

-- 8. إنشاء/إعادة إنشاء Policy للقراءة العامة للـ sections (إذا كانت مفقودة)
-- DROP POLICY IF EXISTS "Allow public read access to sections" ON sections;
-- CREATE POLICY "Allow public read access to sections"
-- ON sections FOR SELECT
-- USING (is_active = true);

