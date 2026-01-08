-- =====================================================
-- إضافة جداول Likes و Reviews للتفاعل مع المحتوى
-- =====================================================

-- Likes Table: لتخزين الـ likes على الصور والفيديوهات
CREATE TABLE IF NOT EXISTS content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_ip VARCHAR(45), -- IP address للتعريف (بدون authentication)
    user_agent TEXT, -- Browser info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_item_id, user_ip) -- منع duplicate likes من نفس IP
);

-- Reviews Table: لتخزين الـ reviews/ratings
CREATE TABLE IF NOT EXISTS content_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_name VARCHAR(100), -- اسم المستخدم (اختياري)
    user_email VARCHAR(255), -- Email (اختياري)
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Rating من 1 إلى 5
    comment TEXT, -- تعليق (اختياري)
    user_ip VARCHAR(45), -- IP address
    is_approved BOOLEAN DEFAULT false, -- يحتاج موافقة من Admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Views Table: لتتبع عدد المشاهدات
CREATE TABLE IF NOT EXISTS content_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    user_ip VARCHAR(45),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_date DATE GENERATED ALWAYS AS (DATE(viewed_at)) STORED -- Column للـ date فقط
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_content_likes_item_id ON content_likes(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_item_id ON content_reviews(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_reviews_approved ON content_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_content_views_item_id ON content_views(content_item_id);

-- Unique index لمنع duplicate views في نفس اليوم
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_views_unique_per_day 
ON content_views(content_item_id, user_ip, viewed_date);

-- Enable RLS
ALTER TABLE content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies للـ Likes
CREATE POLICY "Allow public read access to content_likes"
ON content_likes FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to content_likes"
ON content_likes FOR INSERT
WITH CHECK (true);

-- RLS Policies للـ Reviews
CREATE POLICY "Allow public read approved reviews"
ON content_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Allow public insert to content_reviews"
ON content_reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to manage reviews"
ON content_reviews FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies للـ Views
CREATE POLICY "Allow public read access to content_views"
ON content_views FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to content_views"
ON content_views FOR INSERT
WITH CHECK (true);

-- Trigger لتحديث updated_at في reviews
CREATE TRIGGER update_content_reviews_updated_at BEFORE UPDATE ON content_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

