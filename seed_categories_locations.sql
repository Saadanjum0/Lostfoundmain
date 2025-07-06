-- Seed Categories and Locations for Lost & Found System
-- Run this script in your Supabase SQL Editor to populate the required data

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM categories;
-- DELETE FROM locations;

-- Insert Categories
INSERT INTO categories (id, name, description, icon, color, is_active) VALUES
  (gen_random_uuid(), 'Electronics', 'Phones, laptops, chargers, headphones, etc.', '📱', '#3B82F6', true),
  (gen_random_uuid(), 'Clothing', 'Jackets, sweaters, shoes, accessories', '👕', '#EF4444', true),
  (gen_random_uuid(), 'Books & Stationery', 'Textbooks, notebooks, pens, calculators', '📚', '#10B981', true),
  (gen_random_uuid(), 'Bags & Backpacks', 'Backpacks, purses, wallets, luggage', '🎒', '#F59E0B', true),
  (gen_random_uuid(), 'Keys & Cards', 'House keys, car keys, ID cards, access cards', '🔑', '#8B5CF6', true),
  (gen_random_uuid(), 'Jewelry & Accessories', 'Watches, rings, necklaces, glasses', '💎', '#EC4899', true),
  (gen_random_uuid(), 'Sports Equipment', 'Balls, rackets, gym equipment, sports gear', '⚽', '#06B6D4', true),
  (gen_random_uuid(), 'Documents', 'IDs, passports, certificates, important papers', '📄', '#6B7280', true),
  (gen_random_uuid(), 'Water Bottles & Containers', 'Water bottles, lunch boxes, thermoses', '🍸', '#14B8A6', true),
  (gen_random_uuid(), 'Other', 'Items that don''t fit other categories', '❓', '#6B7280', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Locations
INSERT INTO locations (id, name, description, building, floor, is_active) VALUES
  (gen_random_uuid(), 'Main Library', 'Central campus library', 'Library Building', 'All Floors', true),
  (gen_random_uuid(), 'Student Center', 'Main student activity center', 'Student Center', 'Ground Floor', true),
  (gen_random_uuid(), 'Cafeteria', 'Main dining hall', 'Dining Hall', 'Ground Floor', true),
  (gen_random_uuid(), 'Gym & Recreation Center', 'Campus fitness center', 'Recreation Building', 'All Floors', true),
  (gen_random_uuid(), 'Science Building', 'Chemistry, Physics, Biology labs', 'Science Complex', 'All Floors', true),
  (gen_random_uuid(), 'Engineering Building', 'Computer labs, engineering classrooms', 'Engineering Complex', 'All Floors', true),
  (gen_random_uuid(), 'Business Building', 'Business school classrooms and offices', 'Business Complex', 'All Floors', true),
  (gen_random_uuid(), 'Arts Building', 'Art studios, music rooms, theater', 'Arts Complex', 'All Floors', true),
  (gen_random_uuid(), 'Dormitory - North', 'North campus residence halls', 'North Dorms', 'All Floors', true),
  (gen_random_uuid(), 'Dormitory - South', 'South campus residence halls', 'South Dorms', 'All Floors', true),
  (gen_random_uuid(), 'Parking Lot A', 'Main campus parking area', 'Outdoor', 'Ground Level', true),
  (gen_random_uuid(), 'Parking Lot B', 'Student parking area', 'Outdoor', 'Ground Level', true),
  (gen_random_uuid(), 'Campus Quad', 'Central outdoor area', 'Outdoor', 'Ground Level', true),
  (gen_random_uuid(), 'Bookstore', 'Campus bookstore', 'Student Center', '1st Floor', true),
  (gen_random_uuid(), 'Computer Lab', 'General computer lab', 'Various Buildings', 'Various Floors', true),
  (gen_random_uuid(), 'Lecture Hall', 'Large lecture rooms', 'Various Buildings', 'Various Floors', true),
  (gen_random_uuid(), 'Study Rooms', 'Group study areas', 'Various Buildings', 'Various Floors', true),
  (gen_random_uuid(), 'Bus Stop', 'Campus transportation stops', 'Outdoor', 'Ground Level', true),
  (gen_random_uuid(), 'Administrative Offices', 'Registrar, financial aid, etc.', 'Admin Building', 'All Floors', true),
  (gen_random_uuid(), 'Other Location', 'Not listed above', 'Various', 'Various', true)
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT 'Categories inserted:' as info, count(*) as count FROM categories WHERE is_active = true
UNION ALL
SELECT 'Locations inserted:' as info, count(*) as count FROM locations WHERE is_active = true;

-- Display sample data
SELECT 'Sample Categories:' as type, name, icon, color FROM categories WHERE is_active = true LIMIT 5
UNION ALL
SELECT 'Sample Locations:' as type, name, building, floor FROM locations WHERE is_active = true LIMIT 5; 