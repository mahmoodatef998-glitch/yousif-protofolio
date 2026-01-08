-- =====================================================
-- إصلاح RLS Policy للسماح بإضافة Reviews من Public
-- =====================================================

-- حذف الـ policy القديمة إن وجدت
DROP POLICY IF EXISTS "Allow public insert to content_reviews" ON content_reviews;

-- إنشاء Policy جديدة للـ INSERT (يسمح للجميع بإضافة reviews)
-- مهم: استخدام TO public أو TO anon للسماح للمستخدمين غير المسجلين
CREATE POLICY "Allow public insert to content_reviews"
ON content_reviews FOR INSERT
TO public
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
    RAISE NOTICE '✅ تم إصلاح RLS Policy للسماح بإضافة Reviews من Public بنجاح!';
    RAISE NOTICE '⚠️ تأكد من أن الـ policy تم إنشاؤها بشكل صحيح';
END $$;

