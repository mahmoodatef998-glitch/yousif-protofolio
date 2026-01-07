-- =====================================================
-- إعادة إنشاء جدول about_content بالكامل
-- =====================================================
-- ⚠️ تحذير: هذا السكريبت سيحذف جميع البيانات الموجودة في about_content
-- استخدمه فقط إذا كنت متأكداً أو إذا كان الجدول فارغاً

-- حذف الجدول القديم (سيحذف جميع البيانات)
DROP TABLE IF EXISTS about_content CASCADE;

-- إنشاء الجدول من الصفر مع جميع الأعمدة المطلوبة
CREATE TABLE about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title VARCHAR(200),
    hero_subtitle TEXT,
    bio_text TEXT,
    profile_image_url TEXT,
    stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء Trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_about_content_updated_at ON about_content;

CREATE TRIGGER update_about_content_updated_at 
    BEFORE UPDATE ON about_content
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- تفعيل Row Level Security (RLS)
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- حذف Policies القديمة إن وجدت
DROP POLICY IF EXISTS "Allow authenticated users full access to about_content" ON about_content;
DROP POLICY IF EXISTS "Allow public read access to about_content" ON about_content;

-- إنشاء Policy للمستخدمين المصرح لهم (للإدارة)
CREATE POLICY "Allow authenticated users full access to about_content"
ON about_content FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- إنشاء Policy للقراءة العامة (للصفحة الرئيسية)
CREATE POLICY "Allow public read access to about_content"
ON about_content FOR SELECT
USING (true);

-- التحقق من الأعمدة
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'about_content'
ORDER BY ordinal_position;

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE '✅ جدول about_content تم إنشاؤه بنجاح مع جميع الأعمدة المطلوبة!';
    RAISE NOTICE '⚠️ ملاحظة: إذا استمرت المشكلة، قد تحتاج إلى إعادة بناء Schema Cache في Supabase';
END $$;

