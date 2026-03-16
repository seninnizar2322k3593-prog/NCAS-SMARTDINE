# Quick Setup Guide for NCAS SMART DINE

This guide will help you set up the NCAS SMART DINE application quickly.

## Prerequisites

- Node.js 18.x or higher installed
- npm package manager
- Supabase account (free tier is sufficient)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created
3. Go to the **SQL Editor** in your Supabase dashboard
4. Open `DATABASE_SCHEMA.md` in this repository
5. Copy and run each SQL query in the SQL Editor:
   - First create the `students` table
   - Then create the `menu_items` table
   - Finally create the `orders` table
6. Insert the sample admin user:
   ```sql
   INSERT INTO students (student_id, name, email, phone, dob, role, created_at)
   VALUES ('ADMIN001', 'Admin User', 'admin@ncas.edu', '1234567890', '1990-01-01', 'admin', NOW());
   ```
7. Optionally add sample menu items from DATABASE_SCHEMA.md

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to **Settings** → **API** in your Supabase project
   - Copy the **Project URL**
   - Copy the **anon/public** key

3. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_UPI_ID=canteen@paytm
   NEXT_PUBLIC_UPI_NAME=College Canteen
   ```

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Login

Use the sample admin credentials:
- **Student ID**: `ADMIN001`
- **DOB**: `1990-01-01`

## Step 6: Add Menu Items

1. After logging in as admin, go to **Menu Management**
2. Click **+ Add Menu Item**
3. Fill in the form:
   - Item Name (e.g., "Chicken Biryani")
   - Category (e.g., "Main Course")
   - Price (e.g., 120)
   - Available Quantity (e.g., 50)
   - Available Date (today's date)
   - Check "Available for ordering"
4. Click **Add Item**

## Step 7: Create a Student Account

1. Logout from admin account
2. Click **Register here** on the login page
3. Fill in student details:
   - Student ID (e.g., "CS001")
   - Name
   - Email
   - Phone
   - Date of Birth
   - Department
   - Year
4. Click **Register**
5. Login with the new Student ID and DOB

## Step 8: Place a Test Order

1. Login as a student
2. Go to **Menu**
3. Add items to cart
4. Click **Proceed to Checkout**
5. Select a UPI payment method
6. The order will be created with a QR code

## Step 9: Test QR Scanner (Admin)

1. Login as admin
2. Go to **Scanner**
3. Either:
   - Click **Start Scanner** and scan the order QR code
   - Or use **Manual Order Lookup** and enter the order ID
4. View order details
5. Update order status (Confirmed → Preparing → Ready → Completed)

## Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that `.env.local` file exists and has correct values
- Run `npm run build` to check for errors

### Supabase Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that database tables are created properly
- Ensure your Supabase project is active

### Camera Not Working in Scanner
- Use HTTPS (camera requires secure context)
- Grant camera permissions in browser
- Try a different browser if issues persist

### UPI Payment Not Opening
- This feature requires a mobile device with UPI app installed
- On desktop, it will try to open but may not work
- Test on actual mobile device for full UPI integration

## Next Steps

- Add more menu items for different categories
- Create additional student accounts
- Test the full order flow
- Customize the UI colors and branding
- Add your own images for menu items

## Production Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click **Import Project**
4. Select your GitHub repository
5. Add environment variables in Vercel settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_UPI_ID`
   - `NEXT_PUBLIC_UPI_NAME`
6. Click **Deploy**

Your application will be live at `https://your-project.vercel.app`

## Support

For issues and questions:
- Check `README.md` for detailed documentation
- Review `DATABASE_SCHEMA.md` for database setup
- Create an issue on GitHub

---

**Happy Coding! 🍽️**
