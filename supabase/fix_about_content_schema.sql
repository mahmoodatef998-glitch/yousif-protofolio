-- =====================================================
-- إصلاح جدول about_content - إضافة الأعمدة المفقودة
-- =====================================================
-- هذا السكريبت يتحقق من وجود الأعمدة ويضيفها إذا كانت مفقودة

-- إضافة hero_title إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'hero_title'
    ) THEN
        ALTER TABLE about_content ADD COLUMN hero_title VARCHAR(200);
    END IF;
END $$;

-- إضافة hero_subtitle إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'hero_subtitle'
    ) THEN
        ALTER TABLE about_content ADD COLUMN hero_subtitle TEXT;
    END IF;
END $$;

-- إضافة bio_text إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'bio_text'
    ) THEN
        ALTER TABLE about_content ADD COLUMN bio_text TEXT;
    END IF;
END $$;

-- إضافة profile_image_url إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'profile_image_url'
    ) THEN
        ALTER TABLE about_content ADD COLUMN profile_image_url TEXT;
    END IF;
END $$;

-- إضافة stats إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'stats'
    ) THEN
        ALTER TABLE about_content ADD COLUMN stats JSONB;
    END IF;
END $$;

-- إضافة created_at إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE about_content ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- إضافة updated_at إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'about_content' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE about_content ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- التحقق من وجود الجدول وإنشاؤه إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS about_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title VARCHAR(200),
    hero_subtitle TEXT,
    bio_text TEXT,
    profile_image_url TEXT,
    stats JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- عرض الأعمدة الحالية للتحقق
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'about_content'
ORDER BY ordinal_position;

