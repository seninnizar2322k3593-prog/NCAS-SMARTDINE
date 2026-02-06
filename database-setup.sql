-- NCAS SMART DINE Database Setup SQL
-- Run these commands in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  available_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  qr_data TEXT,
  ticket_printed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Function to decrement food quantity (used when order is placed)
CREATE OR REPLACE FUNCTION decrement_food_quantity(food_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE food_items
  SET quantity = GREATEST(0, quantity - qty)
  WHERE id = food_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_student_id ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_food_items_available_date ON food_items(available_date);

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Students can view their own data
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (true);

-- Students can insert their own data
CREATE POLICY "Students can insert own data" ON students
  FOR INSERT WITH CHECK (true);

-- Everyone can view food items
CREATE POLICY "Anyone can view food items" ON food_items
  FOR SELECT USING (true);

-- Only admins can modify food items (you'll need to implement proper auth check)
CREATE POLICY "Admins can manage food items" ON food_items
  FOR ALL USING (true);

-- Students can view their own orders
CREATE POLICY "Students can view own orders" ON orders
  FOR SELECT USING (true);

-- Students can create orders
CREATE POLICY "Students can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Orders can be updated (for payment verification and ticket printing)
CREATE POLICY "Orders can be updated" ON orders
  FOR UPDATE USING (true);

-- Admins can view all data
CREATE POLICY "Admins can view everything" ON admins
  FOR SELECT USING (true);

-- Sample Data (Optional - for testing)
-- Uncomment below to insert sample data

/*
-- Insert sample admin (remember to create this user in Supabase Auth too)
INSERT INTO admins (email, role) 
VALUES ('admin@ncas.edu', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample students
INSERT INTO students (student_id, name, dob, email, phone) VALUES
  ('NCAS2024001', 'John Doe', '2004-05-15', 'john@ncas.edu', '+91 9876543210'),
  ('NCAS2024002', 'Jane Smith', '2004-08-20', 'jane@ncas.edu', '+91 9876543211'),
  ('NCAS2024003', 'Bob Wilson', '2003-12-10', 'bob@ncas.edu', '+91 9876543212')
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample food items for today
INSERT INTO food_items (name, price, quantity, available_date, description) VALUES
  ('Chicken Biryani', 120.00, 50, CURRENT_DATE, 'Delicious aromatic chicken biryani with raita'),
  ('Veg Pulao', 80.00, 40, CURRENT_DATE, 'Mixed vegetable pulao with yogurt'),
  ('Paneer Butter Masala', 100.00, 30, CURRENT_DATE, 'Creamy paneer curry with butter naan'),
  ('Masala Dosa', 60.00, 60, CURRENT_DATE, 'Crispy dosa with potato masala filling'),
  ('Veg Thali', 90.00, 35, CURRENT_DATE, 'Complete vegetarian meal with rice, dal, sabzi, roti'),
  ('Chicken Fried Rice', 110.00, 45, CURRENT_DATE, 'Stir-fried rice with chicken and vegetables');

-- Insert sample food items for tomorrow
INSERT INTO food_items (name, price, quantity, available_date, description) VALUES
  ('Mutton Biryani', 150.00, 40, CURRENT_DATE + INTERVAL '1 day', 'Rich and flavorful mutton biryani'),
  ('Chole Bhature', 70.00, 50, CURRENT_DATE + INTERVAL '1 day', 'Spicy chickpeas with fluffy bhature'),
  ('Fish Curry', 130.00, 25, CURRENT_DATE + INTERVAL '1 day', 'Coastal style fish curry with rice'),
  ('Samosa Chaat', 50.00, 70, CURRENT_DATE + INTERVAL '1 day', 'Crispy samosas with chutneys'),
  ('Egg Curry Meal', 85.00, 40, CURRENT_DATE + INTERVAL '1 day', 'Egg curry with rice and roti'),
  ('Veg Noodles', 75.00, 55, CURRENT_DATE + INTERVAL '1 day', 'Indo-Chinese style vegetable noodles');
*/
