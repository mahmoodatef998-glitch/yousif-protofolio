-- =====================================================
-- إصلاح نهائي لـ RLS Policy للسماح بإضافة Reviews من Public
-- =====================================================

-- تعطيل RLS مؤقتاً للتأكد من أن الـ policies صحيحة
ALTER TABLE content_reviews DISABLE ROW LEVEL SECURITY;

-- حذف جميع الـ policies القديمة
DROP POLICY IF EXISTS "Allow public insert to content_reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow authenticated users to manage reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow public read approved reviews" ON content_reviews;

-- إعادة تفعيل RLS
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

-- إنشاء Policy للـ SELECT (قراءة الـ reviews المعتمدة فقط)
CREATE POLICY "Allow public read approved reviews"
ON content_reviews FOR SELECT
TO public
USING (is_approved = true);

-- إنشاء Policy للـ INSERT (يسمح للجميع بإضافة reviews)
-- مهم جداً: استخدام TO public للسماح للمستخدمين غير المسجلين
CREATE POLICY "Allow public insert to content_reviews"
ON content_reviews FOR INSERT
TO public
WITH CHECK (true);

-- إنشاء Policy للمستخدمين المسجلين (للإدارة)
CREATE POLICY "Allow authenticated users to manage reviews"
ON content_reviews FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- التحقق من الـ policies
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
WHERE tablename = 'content_reviews'
ORDER BY policyname;

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح RLS Policies للسماح بإضافة Reviews من Public بنجاح!';
    RAISE NOTICE '📋 Policies المطبقة:';
    RAISE NOTICE '   - Allow public read approved reviews (SELECT)';
    RAISE NOTICE '   - Allow public insert to content_reviews (INSERT)';
    RAISE NOTICE '   - Allow authenticated users to manage reviews (ALL)';
END $$;

