# NCAS SMART DINE - QR-Based College Canteen Pre-Order & Ticket Printing System

A modern, full-stack web application built with Next.js for college canteen food pre-ordering with QR-based ticket validation and printing.

## 🎓 Project Overview

This is a complete college final-year project that allows students to:
- Register and login to the system
- Browse today's and tomorrow's menu
- Place orders with UPI payment (PhonePe, Google Pay, Paytm)
- Receive QR codes for their orders
- View order history and status

Admins can:
- Manage menu items (CRUD operations)
- View and track all orders
- Generate sales reports and analytics
- Monitor inventory and revenue

The QR scanner validates orders and triggers ticket printing for food collection.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom Student Auth
- **Payments**: UPI Deep Links (PhonePe, Google Pay, Paytm)
- **QR Generation**: qrcode library
- **QR Scanning**: html5-qrcode library
- **Styling**: Pure CSS with CSS Variables

## 📁 Project Structure

```
ncas-smart-dine/
│
├── public/
│   ├── images/              # Static images
│   └── qr/                  # QR code storage
│
├── src/
│   ├── app/
│   │   ├── layout.js        # Root layout
│   │   ├── page.js          # Home/landing page
│   │   ├── globals.css      # Global styles
│   │
│   │   ├── auth/
│   │   │   ├── login/page.js        # Login page
│   │   │   └── register/page.js     # Registration page
│   │
│   │   ├── student/
│   │   │   ├── dashboard/page.js    # Student dashboard
│   │   │   ├── menu/page.js         # Menu browsing & ordering
│   │   │   ├── orders/page.js       # Order history with QR codes
│   │   │   └── profile/page.js      # Student profile
│   │
│   │   ├── admin/
│   │   │   ├── dashboard/page.js            # Admin dashboard
│   │   │   ├── menu-management/page.js      # Menu CRUD
│   │   │   ├── orders/page.js               # Order management
│   │   │   └── reports/page.js              # Reports & analytics
│   │
│   │   ├── scanner/page.js          # QR scanner & ticket printing
│   │
│   │   └── api/
│   │       ├── payment/
│   │       │   ├── create-order/route.js    # Create UPI Payment order
│   │       │   └── verify/route.js          # Verify payment
│   │       └── scanner/
│   │           └── validate/route.js        # Validate QR & print
│   │
│   ├── components/
│   │   ├── StudentNav.js    # Student navigation
│   │   └── AdminNav.js      # Admin navigation
│   │
│   ├── services/
│   │   └── supabase.js      # Supabase client config
│   │
│   ├── utils/               # Utility functions
│   ├── data/                # Static data
│   └── styles/              # Additional styles
│
├── .env.local               # Environment variables
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- UPI Payment account (test mode available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seninnizar2322k3593-prog/NCAS-SMARTDINE.git
   cd NCAS-SMARTDINE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Update the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_UPI_ID=merchant@upi
   NEXT_PUBLIC_UPI_NAME=NCAS Smart Dine
   ```

4. **Set up Supabase Database**

   Go to your Supabase project SQL Editor and run the SQL commands from `database-setup.sql`.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗃️ Database Setup

Run the SQL commands from `database-setup.sql` in your Supabase SQL Editor to create all necessary tables, functions, and sample data.

## 🔑 Admin Setup

To create an admin user:

1. Go to your Supabase project → Authentication → Users
2. Click "Add user" and create a user with email and password
3. Note the email address
4. Go to SQL Editor and run:
   ```sql
   INSERT INTO admins (email, role) VALUES ('your-admin@email.com', 'admin');
   ```

## 💳 UPI Payment Configuration

The application uses UPI deep links for direct payment through UPI apps:

1. Set your UPI ID in `.env.local`:
   ```
   NEXT_PUBLIC_UPI_ID=yourmerchant@upi
   NEXT_PUBLIC_UPI_NAME=NCAS Smart Dine
   ```

2. Supported UPI apps:
   - PhonePe
   - Google Pay (GPay)
   - Paytm
   - Any other UPI app

3. **How it works:**
   - Student selects items and proceeds to checkout
   - Payment page displays UPI app options
   - Clicking an app opens the UPI payment interface
   - Student completes payment in their UPI app
   - Order is created immediately (no verification)
   - QR code is generated for order pickup

## 📱 Features

### Student Features
- ✅ Student registration with ID and DOB
- ✅ Login authentication
- ✅ Browse menu (today & tomorrow)
- ✅ Add items to cart
- ✅ UPI payment via PhonePe, Google Pay, Paytm
- ✅ QR code generation for orders
- ✅ View order history
- ✅ Track order status
- ✅ View profile

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Add/Edit/Delete food items
- ✅ Manage menu availability
- ✅ View all orders
- ✅ Filter orders by status, date
- ✅ Generate sales reports
- ✅ Top/Least sold items analysis
- ✅ Revenue tracking

### Scanner Features
- ✅ Camera-based QR scanning
- ✅ Order validation
- ✅ Auto-print ticket layout
- ✅ Prevent duplicate printing
- ✅ Order completion tracking

## 🎨 UI Highlights

- Modern gradient backgrounds
- Card-based layouts
- Responsive design (mobile-friendly)
- Smooth transitions and hover effects
- Professional color scheme
- Clean typography
- Status badges and indicators
- Interactive forms with validation

## 🔒 Security Features

- Direct UPI payment (no payment gateway)
- Protected API routes
- Client-side auth checks
- Environment variables for configuration
- SQL injection prevention via Supabase

## 📊 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🧪 Testing the Application

1. **Register as a student** using the registration page
2. **Login** with your Student ID and DOB
3. **Browse menu** and add items to cart
4. **Proceed to checkout** - you'll be redirected to the UPI payment page
5. **Select a UPI app** (PhonePe, Google Pay, or Paytm)
6. **Complete payment** in your UPI app
7. **View your order** with QR code in the orders page
8. **Scan QR code** using the scanner page to print ticket

## 🎓 Viva Preparation

### Key Points to Explain:

1. **Architecture**: Next.js App Router with server and client components
2. **Database**: Supabase PostgreSQL with relational schema
3. **Payment Flow**: UPI deep links → external payment → order creation
4. **QR System**: Generate on order creation → scan → validate → print
5. **Security**: Client-side checks, environment variables, auth validation
6. **State Management**: React hooks (useState, useEffect)
7. **Styling**: CSS variables for consistent theming

### Demo Flow:
1. Show student registration and login
2. Demonstrate menu browsing and cart
3. Navigate to UPI payment page
4. Show UPI app selection (PhonePe/Google Pay/Paytm)
5. Order creation and QR code generation
6. Scan and print ticket
7. Switch to admin panel
8. Show menu management
9. Generate reports

## 🤝 Contributing

This is a college project, but suggestions are welcome!

## 📝 License

MIT License - Feel free to use for educational purposes

## 👨‍💻 Author

NCAS College Final Year Project

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This is a demonstration project for educational purposes. For production use, additional security measures and testing would be required.