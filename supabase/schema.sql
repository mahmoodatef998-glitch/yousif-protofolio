    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_content_items_section_id ON content_items(section_id);
    CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(section_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_sections_display_order ON sections(display_order);
    CREATE INDEX IF NOT EXISTS idx_sections_is_active ON sections(is_active);

    -- Enable Row Level Security (RLS)
    ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
    ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
    ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist (to avoid errors on re-run)
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

    -- Create policies: Allow authenticated users full access
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

    -- Allow public read access (for homepage)
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

    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Drop existing triggers if they exist (to avoid errors on re-run)
    DROP TRIGGER IF EXISTS update_sections_updated_at ON sections;
    DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
    DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
    DROP TRIGGER IF EXISTS update_contact_info_updated_at ON contact_info;
    DROP TRIGGER IF EXISTS update_about_content_updated_at ON about_content;

    -- Create triggers for updated_at
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

    -- Insert default sections
    INSERT INTO sections (name, title, type, display_order, is_active) VALUES
    ('about', 'About Me', 'text', 1, true),
    ('videos', 'Videos', 'video', 2, true),
    ('reels', 'Reels', 'video', 3, true),
    ('wedding', 'Wedding', 'gallery', 4, true),
    ('product', 'Product', 'gallery', 5, true),
    ('restaurant', 'Restaurant', 'gallery', 6, true),
    ('contact', 'Contact', 'contact', 7, true)
    ON CONFLICT (name) DO NOTHING;

