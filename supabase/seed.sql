-- Insert default sections
INSERT INTO sections (name, title, description, type, is_active, display_order) VALUES
('about', 'About Me', 'Personal information and bio', 'text', true, 1),
('videos', 'Videos', 'Full-screen video content', 'video', true, 2),
('reels', 'Reels', 'Short video reels', 'video', true, 3),
('wedding', 'Wedding', 'Wedding photography gallery', 'gallery', true, 4),
('product', 'Product', 'Product photography gallery', 'gallery', true, 5),
('restaurant', 'Restaurant', 'Restaurant photography gallery', 'gallery', true, 6),
('contact', 'Contact', 'Contact information', 'text', true, 7)
ON CONFLICT (name) DO NOTHING;

-- Insert demo content for each section
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

