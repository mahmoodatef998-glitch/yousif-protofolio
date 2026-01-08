-- =====================================================
-- ملف SQL شامل ونهائي لإعداد قاعدة البيانات بالكامل
-- ⚠️ تحذير: هذا الملف سيحذف جميع البيانات والجداول الموجودة
-- قم بتشغيل هذا الملف في Supabase SQL Editor مرة واحدة فقط
-- =====================================================

-- =====================================================
-- الجزء 1: حذف جميع الجداول والبيانات القديمة
-- =====================================================
-- ⚠️ هذا سيحذف كل شيء - تأكد من أنك تريد ذلك!

-- حذف الجداول بالترتيب الصحيح (مع مراعاة Foreign Keys)
DROP TABLE IF EXISTS content_views CASCADE;
DROP TABLE IF EXISTS content_likes CASCADE;
DROP TABLE IF EXISTS content_reviews CASCADE;
DROP TABLE IF EXISTS content_items CASCADE;
DROP TABLE IF EXISTS about_content CASCADE;
DROP TABLE IF EXISTS contact_info CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS sections CASCADE;

-- حذف Functions القديمة
DROP FUNCTION IF EXISTS update_viewed_date() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_content_likes_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_content_rating(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_content_views_count(UUID) CASCADE;

-- =====================================================
-- الجزء 2: إنشاء Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- الجزء 3: إنشاء الجداول الأساسية
-- =====================================================

-- Sections Table: إدارة جميع أقسام الموقع
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200),
    description TEXT,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Items Table: تخزين جميع المحتويات (صور، فيديوهات، نصوص)
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    media_type VARCHAR(50) NOT NULL,
    media_url TEXT,
    thumbnail_url TEXT,
    cloudinary_public_id TEXT,
    order_index INTEGER DEFAULT 0,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table: إعدادات الموقع العامة
CREATE TABLE site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Info Table: معلومات الاتصال
CREATE TABLE contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    phone VARCHAR(50),
    instagram_url TEXT,
    linkedin_url TEXT,
    address TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Content Table: محتوى قسم About
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

-- =====================================================
-- الجزء 4: إنشاء جداول التفاعل (Likes, Reviews, Views)
-- =====================================================

-- Content Likes Table: تخزين الـ likes على الصور والفيديوهات
CREATE TABLE content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_item_id, user_ip)
);

-- Content Reviews Table: تخزين الـ reviews/ratings
CREATE TABLE content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_ip VARCHAR(45),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Views Table: تتبع عدد المشاهدات
CREATE TABLE content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_date DATE DEFAULT (CURRENT_DATE)
);

-- =====================================================
-- الجزء 5: إنشاء Indexes للأداء
-- =====================================================

-- Indexes للجداول الأساسية
CREATE INDEX idx_content_items_section_id ON content_items(section_id);
CREATE INDEX idx_content_items_order ON content_items(section_id, order_index);
CREATE INDEX idx_sections_display_order ON sections(display_order);
CREATE INDEX idx_sections_is_active ON sections(is_active);
CREATE INDEX idx_content_items_is_active ON content_items(is_active);

-- Indexes لجداول التفاعل
CREATE INDEX idx_content_likes_item_id ON content_likes(content_item_id);
CREATE INDEX idx_content_reviews_item_id ON content_reviews(content_item_id);
CREATE INDEX idx_content_reviews_approved ON content_reviews(is_approved);
CREATE INDEX idx_content_views_item_id ON content_views(content_item_id);

-- Unique index لمنع duplicate views في نفس اليوم
CREATE UNIQUE INDEX idx_content_views_unique_per_day 
ON content_views(content_item_id, user_ip, viewed_date);

-- =====================================================
-- الجزء 6: إنشاء Functions
-- =====================================================

-- Function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function لتحديث viewed_date تلقائياً
CREATE OR REPLACE FUNCTION update_viewed_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.viewed_date := CURRENT_DATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function لحساب إجمالي الـ likes
CREATE OR REPLACE FUNCTION get_content_likes_count(item_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM content_likes WHERE content_item_id = item_id);
END;
$$ LANGUAGE plpgsql;

-- Function لحساب متوسط الـ rating
CREATE OR REPLACE FUNCTION get_content_rating(item_id UUID)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating), 0)
        FROM content_reviews
        WHERE content_item_id = item_id AND is_approved = true
    );
END;
$$ LANGUAGE plpgsql;

-- Function لحساب عدد المشاهدات
CREATE OR REPLACE FUNCTION get_content_views_count(item_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM content_views WHERE content_item_id = item_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- الجزء 7: إنشاء Triggers
-- =====================================================

-- Triggers لتحديث updated_at
CREATE TRIGGER update_sections_updated_at 
    BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at 
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at 
    BEFORE UPDATE ON contact_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at 
    BEFORE UPDATE ON about_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_reviews_updated_at 
    BEFORE UPDATE ON content_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger لتحديث viewed_date تلقائياً
CREATE TRIGGER set_viewed_date_before_insert
    BEFORE INSERT ON content_views
    FOR EACH ROW
    EXECUTE FUNCTION update_viewed_date();

-- =====================================================
-- الجزء 8: تفعيل Row Level Security (RLS)
-- =====================================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- الجزء 9: إنشاء RLS Policies
-- =====================================================

-- Policies للجداول الأساسية - للمستخدمين المصرح لهم
CREATE POLICY "Allow authenticated users full access to sections"
ON sections FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to content_items"
ON content_items FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to site_settings"
ON site_settings FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to contact_info"
ON contact_info FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to about_content"
ON about_content FOR ALL
USING (auth.role() = 'authenticated');

-- Policies للجداول الأساسية - للقراءة العامة
CREATE POLICY "Allow public read access to sections"
ON sections FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read access to content_items"
ON content_items FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read access to site_settings"
ON site_settings FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to contact_info"
ON contact_info FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to about_content"
ON about_content FOR SELECT
USING (true);

-- Policies لجداول التفاعل - Likes
CREATE POLICY "Allow public read access to content_likes"
ON content_likes FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to content_likes"
ON content_likes FOR INSERT
WITH CHECK (true);

-- Policies لجداول التفاعل - Reviews
CREATE POLICY "Allow public read approved reviews"
ON content_reviews FOR SELECT
USING (is_approved = true);

-- Policy للـ INSERT (يسمح للجميع بإضافة reviews)
-- مهم: يجب أن يكون TO public للسماح للمستخدمين غير المسجلين
CREATE POLICY "Allow public insert to content_reviews"
ON content_reviews FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage reviews"
ON content_reviews FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Policies لجداول التفاعل - Views
CREATE POLICY "Allow public read access to content_views"
ON content_views FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to content_views"
ON content_views FOR INSERT
WITH CHECK (true);

-- =====================================================
-- الجزء 10: إدراج البيانات الافتراضية
-- =====================================================

-- إدراج Sections الافتراضية
INSERT INTO sections (name, title, description, type, is_active, display_order) VALUES
('about', 'About Me', 'Personal information and bio', 'text', true, 1),
('videos', 'Videos', 'Full-screen video content', 'video', true, 2),
('reels', 'Reels', 'Short video reels', 'video', true, 3),
('wedding', 'Wedding', 'Wedding photography gallery', 'gallery', true, 4),
('product', 'Product', 'Product photography gallery', 'gallery', true, 5),
('restaurant', 'Restaurant', 'Restaurant photography gallery', 'gallery', true, 6),
('contact', 'Contact', 'Contact information', 'contact', true, 7)
ON CONFLICT (name) DO UPDATE 
SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

-- =====================================================
-- الجزء 11: التحقق من النتيجة
-- =====================================================

-- عرض عدد البيانات في كل جدول
SELECT 'sections' as table_name, COUNT(*) as count FROM sections
UNION ALL
SELECT 'content_items', COUNT(*) FROM content_items
UNION ALL
SELECT 'about_content', COUNT(*) FROM about_content
UNION ALL
SELECT 'contact_info', COUNT(*) FROM contact_info
UNION ALL
SELECT 'site_settings', COUNT(*) FROM site_settings
UNION ALL
SELECT 'content_likes', COUNT(*) FROM content_likes
UNION ALL
SELECT 'content_reviews', COUNT(*) FROM content_reviews
UNION ALL
SELECT 'content_views', COUNT(*) FROM content_views;

-- عرض Sections الموجودة
SELECT id, name, title, type, is_active, display_order
FROM sections
ORDER BY display_order;

-- =====================================================
-- تم الانتهاء! ✅
-- =====================================================
-- الآن قاعدة البيانات جاهزة للاستخدام
-- تأكد من:
-- 1. إنشاء Admin User في Authentication > Users
-- 2. إضافة Environment Variables في Vercel
-- 3. اختبار رفع صورة جديدة من Dashboard
-- 4. جميع الجداول والـ Policies جاهزة ✅

