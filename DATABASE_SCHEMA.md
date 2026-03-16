# Database Schema for NCAS SMART DINE

This document describes the database schema required for the NCAS SMART DINE application using Supabase.

## Tables

### 1. students

Stores student information and authentication details.

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  dob DATE NOT NULL,
  department VARCHAR(50),
  year INTEGER,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_email ON students(email);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `student_id`: Unique student identifier
- `name`: Full name of the student
- `email`: Email address
- `phone`: Phone number
- `dob`: Date of birth (used for authentication)
- `department`: Student's department
- `year`: Current year of study (1-4)
- `role`: User role (student/admin)
- `created_at`: Timestamp of account creation
- `updated_at`: Timestamp of last update

### 2. menu_items

Stores menu items available for ordering.

```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  image_url TEXT,
  available_quantity INTEGER DEFAULT 0,
  available_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_menu_items_date ON menu_items(available_date);
CREATE INDEX idx_menu_items_category ON menu_items(category);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `name`: Name of the menu item
- `description`: Description of the item
- `price`: Price in rupees
- `category`: Category (Main Course, Breakfast, Snacks, Beverages, Desserts)
- `image_url`: URL to item image
- `available_quantity`: Number of items available
- `available_date`: Date when item is available
- `is_available`: Whether item is currently available for ordering
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### 3. orders

Stores all orders placed by students.

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(20) DEFAULT 'pending',
  qr_code TEXT,
  order_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- Indexes
CREATE INDEX idx_orders_student_id ON orders(student_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**Fields:**
- `id`: Auto-incrementing primary key
- `student_id`: Reference to student who placed order
- `student_name`: Name of student (cached for performance)
- `items`: JSON array of ordered items with quantities
- `total_amount`: Total order amount
- `payment_method`: Payment method used (PhonePe, Google Pay, Paytm)
- `payment_status`: Payment status (pending, completed, failed)
- `status`: Order status (pending, confirmed, preparing, ready, completed, cancelled)
- `qr_code`: Base64 encoded QR code for order
- `order_date`: Date and time of order
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## Sample Data

### Sample Admin User

```sql
INSERT INTO students (student_id, name, email, phone, dob, role, created_at)
VALUES ('ADMIN001', 'Admin User', 'admin@ncas.edu', '1234567890', '1990-01-01', 'admin', NOW());
```

### Sample Student Users

```sql
INSERT INTO students (student_id, name, email, phone, dob, department, year, created_at)
VALUES 
  ('CS001', 'John Doe', 'john@student.ncas.edu', '9876543210', '2003-05-15', 'Computer Science', 2, NOW()),
  ('CS002', 'Jane Smith', 'jane@student.ncas.edu', '9876543211', '2003-08-20', 'Computer Science', 2, NOW());
```

### Sample Menu Items

```sql
INSERT INTO menu_items (name, description, price, category, available_quantity, available_date, is_available, created_at)
VALUES 
  ('Chicken Biryani', 'Delicious chicken biryani with raita', 120.00, 'Main Course', 50, CURRENT_DATE, true, NOW()),
  ('Veg Thali', 'Complete vegetarian thali with chapati, dal, rice, and sabzi', 80.00, 'Main Course', 40, CURRENT_DATE, true, NOW()),
  ('Masala Dosa', 'Crispy dosa with potato masala', 60.00, 'Breakfast', 30, CURRENT_DATE, true, NOW()),
  ('Tea', 'Hot chai', 10.00, 'Beverages', 100, CURRENT_DATE, true, NOW()),
  ('Coffee', 'Hot coffee', 15.00, 'Beverages', 100, CURRENT_DATE, true, NOW()),
  ('Samosa', 'Crispy samosa (2 pieces)', 20.00, 'Snacks', 60, CURRENT_DATE, true, NOW());
```

## Row Level Security (RLS)

Enable RLS for security:

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Students table policies
CREATE POLICY "Students can read own data" ON students
  FOR SELECT USING (true);

CREATE POLICY "Students can update own data" ON students
  FOR UPDATE USING (student_id = current_setting('app.current_user_id', true));

-- Menu items policies
CREATE POLICY "Anyone can read menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (current_setting('app.user_role', true) = 'admin');

-- Orders policies
CREATE POLICY "Students can read own orders" ON orders
  FOR SELECT USING (student_id = current_setting('app.current_user_id', true));

CREATE POLICY "Students can create orders" ON orders
  FOR INSERT WITH CHECK (student_id = current_setting('app.current_user_id', true));

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (current_setting('app.user_role', true) = 'admin');

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (current_setting('app.user_role', true) = 'admin');
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Run the table creation queries above in order
4. Insert sample data if needed
5. Enable RLS policies for security
6. Copy your Supabase URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Notes

- The `items` field in the orders table stores a JSON array of order items
- QR codes are stored as base64 encoded data URLs
- Date fields use ISO 8601 format
- All timestamps are in UTC
