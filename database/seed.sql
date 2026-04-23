-- Seed data for Smart Supply Sourcing Platform
-- This file contains sample data for development and testing

-- Insert sample users
INSERT INTO users (id, email, name, phone, company_name, role, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'smartsupplysourcing@gmail.com', 'Admin User', '+254712345678', 'Smart Supply Ltd', 'admin', '$2b$10$example_hash_for_admin'),
('550e8400-e29b-41d4-a716-446655440002', 'buyer@example.com', 'John Doe', '+254723456789', 'Industrial Solutions Ltd', 'buyer', '$2b$10$example_hash_for_buyer'),
('550e8400-e29b-41d4-a716-446655440003', 'mary@manufacturing.co.ke', 'Mary Wanjiku', '+254734567890', 'Kenya Manufacturing Co', 'buyer', '$2b$10$example_hash_for_mary');

-- Insert sample products
INSERT INTO products (id, name, category, price, availability, stock_level, description, warranty_duration, warranty_terms, image_urls) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Centrifugal Pump 5HP', 'pumps-motors', 85000, 'in-stock', 15, 'High-efficiency centrifugal pump suitable for industrial water transfer applications', '2 years', 'Manufacturer warranty covers parts and labor', ARRAY['https://res.cloudinary.com/demo/image/upload/sample.jpg']),
('650e8400-e29b-41d4-a716-446655440002', 'Solar Panel 300W', 'energy-systems', 25000, 'in-stock', 50, 'Monocrystalline solar panel with high efficiency rating', '25 years', 'Performance warranty with degradation protection', ARRAY['https://res.cloudinary.com/demo/image/upload/sample.jpg']),
('650e8400-e29b-41d4-a716-446655440003', 'Industrial Generator 10KVA', 'energy-systems', 450000, 'pre-order', 0, 'Diesel-powered industrial generator for backup power', '3 years', 'Comprehensive warranty including engine and alternator', ARRAY['https://res.cloudinary.com/demo/image/upload/sample.jpg']),
('650e8400-e29b-41d4-a716-446655440004', 'Ball Valve 2 inch', 'fluid-control', 3500, 'in-stock', 100, 'Stainless steel ball valve for industrial piping systems', '5 years', 'Corrosion and leak protection warranty', ARRAY['https://res.cloudinary.com/demo/image/upload/sample.jpg']),
('650e8400-e29b-41d4-a716-446655440005', 'Electric Motor 3HP', 'pumps-motors', 65000, 'out-of-stock', 0, 'Three-phase electric motor for industrial applications', '2 years', 'Motor winding and bearing warranty', ARRAY['https://res.cloudinary.com/demo/image/upload/sample.jpg']);

-- Insert product specifications
INSERT INTO product_specifications (product_id, label, value) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Flow Rate', '500 L/min'),
('650e8400-e29b-41d4-a716-446655440001', 'Head', '50 meters'),
('650e8400-e29b-41d4-a716-446655440001', 'Power', '5 HP'),
('650e8400-e29b-41d4-a716-446655440001', 'Inlet Size', '4 inches'),
('650e8400-e29b-41d4-a716-446655440001', 'Outlet Size', '3 inches'),

('650e8400-e29b-41d4-a716-446655440002', 'Power Output', '300W'),
('650e8400-e29b-41d4-a716-446655440002', 'Efficiency', '20.5%'),
('650e8400-e29b-41d4-a716-446655440002', 'Dimensions', '1956 x 992 x 40mm'),
('650e8400-e29b-41d4-a716-446655440002', 'Weight', '22 kg'),
('650e8400-e29b-41d4-a716-446655440002', 'Cell Type', 'Monocrystalline'),

('650e8400-e29b-41d4-a716-446655440003', 'Power Output', '10 KVA'),
('650e8400-e29b-41d4-a716-446655440003', 'Fuel Type', 'Diesel'),
('650e8400-e29b-41d4-a716-446655440003', 'Fuel Consumption', '2.5 L/hour'),
('650e8400-e29b-41d4-a716-446655440003', 'Noise Level', '65 dB'),
('650e8400-e29b-41d4-a716-446655440003', 'Starting System', 'Electric Start'),

('650e8400-e29b-41d4-a716-446655440004', 'Size', '2 inches'),
('650e8400-e29b-41d4-a716-446655440004', 'Material', 'Stainless Steel 316'),
('650e8400-e29b-41d4-a716-446655440004', 'Pressure Rating', '1000 PSI'),
('650e8400-e29b-41d4-a716-446655440004', 'Temperature Range', '-20°C to 200°C'),
('650e8400-e29b-41d4-a716-446655440004', 'Connection Type', 'Threaded'),

('650e8400-e29b-41d4-a716-446655440005', 'Power', '3 HP'),
('650e8400-e29b-41d4-a716-446655440005', 'Speed', '1440 RPM'),
('650e8400-e29b-41d4-a716-446655440005', 'Voltage', '415V'),
('650e8400-e29b-41d4-a716-446655440005', 'Frequency', '50 Hz'),
('650e8400-e29b-41d4-a716-446655440005', 'Frame Size', '132M');

-- Update pre-order product with deposit information
UPDATE products SET 
  deposit_amount = 90000,
  deposit_percentage = 20,
  batch_arrival_date = '2024-06-15',
  escrow_details = 'Deposit held in escrow until delivery confirmation'
WHERE id = '650e8400-e29b-41d4-a716-446655440003';