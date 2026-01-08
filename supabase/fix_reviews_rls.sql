-- =====================================================
-- إصلاح RLS Policies لجدول content_reviews
-- =====================================================

-- حذف الـ policies القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public read approved reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow public insert to content_reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow authenticated users to manage reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow public read all reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow public update reviews" ON content_reviews;
DROP POLICY IF EXISTS "Allow public delete reviews" ON content_reviews;

-- إنشاء Policy للقراءة العامة (فقط الـ reviews المعتمدة)
CREATE POLICY "Allow public read approved reviews"
ON content_reviews FOR SELECT
USING (is_approved = true);

-- إنشاء Policy للـ INSERT (يسمح للجميع بإضافة reviews)
-- مهم: يجب أن يكون WITH CHECK (true) للسماح بإضافة أي review
CREATE POLICY "Allow public insert to content_reviews"
ON content_reviews FOR INSERT
TO public
WITH CHECK (true);

-- إنشاء Policy للمستخدمين المصرح لهم (للإدارة - SELECT, UPDATE, DELETE)
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
WHERE tablename = 'content_reviews';

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ تم إصلاح RLS Policies لجدول content_reviews بنجاح!';
    RAISE NOTICE '⚠️ تأكد من أن الـ policies تم إنشاؤها بشكل صحيح';
END $$;

