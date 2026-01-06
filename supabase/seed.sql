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

