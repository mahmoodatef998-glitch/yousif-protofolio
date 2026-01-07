-- =====================================================
-- ملف SQL شامل لإعداد قاعدة البيانات بالكامل
-- قم بتشغيل هذا الملف في Supabase SQL Editor مرة واحدة
-- =====================================================

-- =====================================================
-- الجزء 1: حذف البيانات والجداول القديمة (اختياري)
-- =====================================================
-- ⚠️ احذر: هذا سيحذف جميع البيانات الموجودة
-- قم بإلغاء التعليق فقط إذا كنت تريد حذف كل شيء والبدء من جديد

-- حذف البيانات القديمة
-- TRUNCATE TABLE content_items CASCADE;
-- TRUNCATE TABLE sections CASCADE;
-- TRUNCATE TABLE about_content CASCADE;
-- TRUNCATE TABLE contact_info CASCADE;
-- TRUNCATE TABLE site_settings CASCADE;

-- حذف الجداول (إذا كنت تريد إعادة إنشاء كل شيء)
-- DROP TABLE IF EXISTS content_items CASCADE;
-- DROP TABLE IF EXISTS sections CASCADE;
-- DROP TABLE IF EXISTS about_content CASCADE;
-- DROP TABLE IF EXISTS contact_info CASCADE;
-- DROP TABLE IF EXISTS site_settings CASCADE;

-- =====================================================
-- الجزء 2: إنشاء Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- الجزء 3: إنشاء الجداول
-- =====================================================

-- Sections Table: Manage all sections of the website
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- about, videos, reels, wedding, product, restaurant, contact
    title VARCHAR(200), -- Display title
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'gallery', 'video', 'text', 'mixed', 'contact'
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Items Table: Store all content (images, videos, text) for each section
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    media_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'text'
    media_url TEXT, -- URL for image/video
    thumbnail_url TEXT,
    cloudinary_public_id TEXT, -- For Cloudinary images
    order_index INTEGER DEFAULT 0,
    metadata JSONB, -- Additional data (video duration, colors, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table: Global site configuration
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Info Table: Contact information
CREATE TABLE IF NOT EXISTS contact_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    phone VARCHAR(50),
    instagram_url TEXT,
    linkedin_url TEXT,
    address TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Section Content: Specific content for About section
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title VARCHAR(200),
    hero_subtitle TEXT,
    bio_text TEXT,
    profile_image_url TEXT,
    stats JSONB, -- Object like {clients: 100, projects: 200, awards: 10}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- الجزء 4: إنشاء Indexes للأداء
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_content_items_section_id ON content_items(section_id);
CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_sections_display_order ON sections(display_order);
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_content_items_is_active ON content_items(is_active);

-- =====================================================
-- الجزء 5: إنشاء Function لتحديث updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- الجزء 6: إنشاء Triggers
-- =====================================================
DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
DROP TRIGGER IF EXISTS update_contact_info_updated_at ON contact_info;
DROP TRIGGER IF EXISTS update_about_content_updated_at ON about_content;

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON about_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- الجزء 7: تفعيل Row Level Security (RLS)
-- =====================================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- الجزء 8: حذف Policies القديمة (إن وجدت)
-- =====================================================
DROP POLICY IF EXISTS "Allow authenticated users full access to sections" ON sections;
DROP POLICY IF EXISTS "Allow authenticated users full access to content_items" ON content_items;
DROP POLICY IF EXISTS "Allow authenticated users full access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users full access to contact_info" ON contact_info;
DROP POLICY IF EXISTS "Allow authenticated users full access to about_content" ON about_content;
DROP POLICY IF EXISTS "Allow public read access to sections" ON sections;
DROP POLICY IF EXISTS "Allow public read access to content_items" ON content_items;
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public read access to contact_info" ON contact_info;
DROP POLICY IF EXISTS "Allow public read access to about_content" ON about_content;

-- =====================================================
-- الجزء 9: إنشاء Policies للمستخدمين المسجلين
-- =====================================================
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

-- =====================================================
-- الجزء 10: إنشاء Policies للقراءة العامة (للصفحة الرئيسية)
-- =====================================================
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

-- =====================================================
-- الجزء 11: إدراج Sections الافتراضية
-- =====================================================
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
-- الجزء 12: إصلاح البيانات القديمة (تعيين is_active = true)
-- =====================================================
-- إصلاح البيانات التي is_active = null أو false
UPDATE content_items 
SET is_active = true 
WHERE is_active IS NULL OR is_active = false;

-- =====================================================
-- الجزء 13: إدراج بيانات Demo (اختياري)
-- =====================================================
-- يمكنك حذف هذا الجزء إذا كنت لا تريد بيانات demo

-- Wedding Images
INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Wedding Ceremony', 'Beautiful wedding ceremony moment', 'image', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200&q=80', 1, true
FROM sections s WHERE s.name = 'wedding'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Bridal Portrait', 'Elegant bridal portrait', 'image', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', 2, true
FROM sections s WHERE s.name = 'wedding'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Reception', 'Wedding reception celebration', 'image', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', 3, true
FROM sections s WHERE s.name = 'wedding'
ON CONFLICT DO NOTHING;

-- Product Images
INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Product Shot 1', 'Professional product photography', 'image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80', 1, true
FROM sections s WHERE s.name = 'product'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Product Shot 2', 'Commercial product photography', 'image', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80', 2, true
FROM sections s WHERE s.name = 'product'
ON CONFLICT DO NOTHING;

-- Restaurant Images
INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Restaurant Interior 1', 'Elegant restaurant interior', 'image', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', 1, true
FROM sections s WHERE s.name = 'restaurant'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Restaurant Interior 2', 'Modern restaurant design', 'image', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80', 2, true
FROM sections s WHERE s.name = 'restaurant'
ON CONFLICT DO NOTHING;

-- Videos
INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Wedding Highlights', 'Capturing the magic of your special day', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1920&q=80', 1, true
FROM sections s WHERE s.name = 'videos'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Portrait Session', 'Professional portraits that tell your story', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1920&q=80', 2, true
FROM sections s WHERE s.name = 'videos'
ON CONFLICT DO NOTHING;

-- Reels
INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Wedding Reel', 'Short wedding highlights reel', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80', 1, true
FROM sections s WHERE s.name = 'reels'
ON CONFLICT DO NOTHING;

INSERT INTO content_items (section_id, title, description, media_type, media_url, thumbnail_url, order_index, is_active)
SELECT s.id, 'Portrait Reel', 'Portrait photography reel', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', 2, true
FROM sections s WHERE s.name = 'reels'
ON CONFLICT DO NOTHING;

-- =====================================================
-- الجزء 14: التحقق من النتيجة
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
SELECT 'site_settings', COUNT(*) FROM site_settings;

-- عرض Sections الموجودة
SELECT id, name, title, type, is_active, display_order
FROM sections
ORDER BY display_order;

-- عرض عينة من البيانات
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
LIMIT 10;

-- =====================================================
-- تم الانتهاء! ✅
-- =====================================================
-- الآن قاعدة البيانات جاهزة للاستخدام
-- تأكد من:
-- 1. إنشاء Admin User في Authentication > Users
-- 2. إضافة Environment Variables في Vercel
-- 3. اختبار رفع صورة جديدة من Dashboard

