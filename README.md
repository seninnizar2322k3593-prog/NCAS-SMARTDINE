# 🍽️ NCAS SMART DINE

## QR-Based College Canteen Pre-Order & Ticket Printing System

A complete full-stack web application for college canteen pre-ordering with QR code-based ticket system and UPI payment integration.

---

## 📋 Features

### Student Module
- **Authentication**: Login with Student ID + DOB
- **Dashboard**: View order statistics and quick actions
- **Menu Browsing**: Browse today's and tomorrow's menu with real-time availability
- **Cart System**: Add items to cart with quantity management
- **UPI Payments**: Direct UPI deep link integration (PhonePe, Google Pay, Paytm)
- **Order Management**: View order history with QR codes
- **Profile Management**: Update personal information

### Admin Module
- **Dashboard**: Analytics and sales overview
- **Menu Management**: Add, edit, delete menu items with images
- **Order Management**: View and update order status
- **Sales Reports**: Revenue reports with date filtering
- **QR Scanner**: Scan student QR codes to verify and complete orders

### Key Features
- ✅ Modern, responsive UI with professional design
- ✅ Real-time order status updates
- ✅ QR code generation for each order
- ✅ Direct UPI payment links (No third-party payment gateway)
- ✅ Mobile-friendly interface
- ✅ Secure authentication

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.x (App Router)
- **Language**: JavaScript
- **Database & Auth**: Supabase
- **Payments**: Direct UPI Deep Links (PhonePe/Google Pay/Paytm)
- **QR Generation**: qrcode library
- **QR Scanning**: html5-qrcode library
- **Styling**: Pure CSS with Flexbox & Grid (No UI libraries)

---

## 📁 Project Structure

```
ncas-smart-dine/
│
├── public/
│   ├── images/          # Static images
│   └── qr/              # Generated QR codes
│
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout
│   │   ├── page.js             # Home page (redirects to login)
│   │   ├── globals.css         # Global styles
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.js      # Login page
│   │   │   └── register/page.js   # Registration page
│   │   │
│   │   ├── student/
│   │   │   ├── dashboard/page.js  # Student dashboard
│   │   │   ├── menu/page.js       # Menu browsing
│   │   │   ├── orders/page.js     # Order history & checkout
│   │   │   └── profile/page.js    # Profile management
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/page.js        # Admin dashboard
│   │   │   ├── menu-management/page.js  # Menu CRUD
│   │   │   ├── orders/page.js           # Order management
│   │   │   └── reports/page.js          # Sales reports
│   │   │
│   │   └── scanner/page.js        # QR code scanner
│   │
│   ├── components/
│   │   ├── Navbar.js           # Navigation component
│   │   └── ProtectedRoute.js   # Auth wrapper
│   │
│   ├── services/
│   │   └── authService.js      # Authentication service
│   │
│   ├── utils/
│   │   └── supabase.js         # Supabase client
│   │
│   └── styles/                 # CSS modules
│
├── .env.local.example          # Environment variables template
├── DATABASE_SCHEMA.md          # Database schema documentation
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/seninnizar2322k3593-prog/NCAS-SMARTDINEf.git
   cd NCAS-SMARTDINEf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the queries from `DATABASE_SCHEMA.md`
   - Copy your Supabase URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_UPI_ID=your_upi_id@paytm
   NEXT_PUBLIC_UPI_NAME=College Canteen
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 💾 Database Setup

See `DATABASE_SCHEMA.md` for complete database schema and setup instructions.

### Quick Setup

1. Create tables in Supabase SQL Editor:
   - `students` - User authentication and profiles
   - `menu_items` - Menu items with availability
   - `orders` - Order history and details

2. Add sample admin user:
   ```sql
   INSERT INTO students (student_id, name, email, phone, dob, role, created_at)
   VALUES ('ADMIN001', 'Admin User', 'admin@ncas.edu', '1234567890', '1990-01-01', 'admin', NOW());
   ```

3. Login credentials:
   - Student ID: `ADMIN001`
   - DOB: `1990-01-01`

---

## 🔐 Authentication Flow

1. Users login with **Student ID + Date of Birth**
2. System validates credentials against Supabase database
3. User session stored in localStorage
4. Protected routes check authentication status
5. Role-based access (student/admin)

---

## 💳 Payment Integration

The application uses **Direct UPI Deep Links** for payments:

```
upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=ORDER_ID
```

**Supported UPI Apps:**
- PhonePe
- Google Pay  
- Paytm

When user clicks payment button:
1. Order is created in database
2. QR code is generated
3. UPI deep link opens payment app
4. User completes payment
5. Order status updated (simulated in demo)

---

## 📱 QR Code System

### Generation
- QR codes generated using `qrcode` library
- Contains: Order ID, Student ID, Amount, Timestamp
- Stored as base64 data URL in database

### Scanning
- Admin uses html5-qrcode to scan
- Camera access required
- Decodes QR and displays order details
- Admin can update order status

---

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Color Scheme**: Blue/Purple gradient with professional palette
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Visual feedback for async operations
- **Error Handling**: User-friendly error messages
- **Accessibility**: Semantic HTML and ARIA labels

---

## 📊 Admin Features

### Dashboard
- Total orders count
- Today's orders
- Pending orders
- Total revenue
- Today's revenue
- Recent orders list

### Menu Management
- Add new menu items
- Edit existing items
- Delete items
- Set availability and quantity
- Upload images
- Category management

### Order Management
- View all orders
- Filter by status
- Search by student
- Update order status
- View order details

### Reports
- Sales analytics
- Date range filtering
- Top selling items
- Revenue breakdown
- Export capabilities (future)

---

## 🔒 Security

- Row Level Security (RLS) in Supabase
- Client-side authentication checks
- Protected API routes
- Input validation
- XSS protection
- CSRF protection via Next.js

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

---

## 📝 Environment Variables

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# UPI Payment Configuration
NEXT_PUBLIC_UPI_ID=canteen@paytm
NEXT_PUBLIC_UPI_NAME=College Canteen
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

### Code Structure

- Use functional components with hooks
- CSS Modules for styling
- Client components marked with 'use client'
- Server components by default

---

## 📖 Usage Guide

### For Students

1. **Register/Login**
   - Use Student ID and DOB to login
   - Register if first time

2. **Browse Menu**
   - View today's or tomorrow's menu
   - Check availability and prices

3. **Place Order**
   - Add items to cart
   - Proceed to checkout
   - Select UPI payment method
   - Complete payment

4. **Track Order**
   - View order status
   - Download QR code
   - Show QR at counter

### For Admins

1. **Manage Menu**
   - Add daily menu items
   - Set quantities and prices
   - Update availability

2. **Process Orders**
   - View incoming orders
   - Update order status
   - Scan QR codes
   - Mark as completed

3. **View Reports**
   - Check daily sales
   - Analyze top items
   - Export reports

---

## 🐛 Troubleshooting

### Common Issues

**Camera not working in scanner:**
- Grant camera permissions in browser
- Use HTTPS (required for camera access)
- Check browser compatibility

**Supabase connection error:**
- Verify environment variables
- Check Supabase project status
- Confirm database tables exist

**Payment not working:**
- Verify UPI ID is correct
- Check if UPI app is installed
- Test on mobile device

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

- **NCAS Development Team**

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- QR code libraries contributors
- NCAS College for the project inspiration

---

## 📞 Support

For support, email support@ncas.edu or create an issue in the repository.

---

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Inventory management
- [ ] Multi-canteen support
- [ ] Rating and reviews
- [ ] Favorites and recommendations

---

**Made with ❤️ for NCAS College**