# Company Market Study System

A comprehensive web application for researching companies, writing reviews, and managing business advertisements. Built with Flask, SQLAlchemy, and Bootstrap 5.

## Features

### User Features
- **Company Search**: Search and filter companies by location, category, and keywords
- **Reviews & Ratings**: View, write, and rate reviews about companies based on experiences
- **Contact Forms**: Direct enquiry system for investors and customers to contact companies
- **User Authentication**: Secure registration and login system with password hashing

### Business Services (Paid Features)
- **SEO Optimization**: Professional SEO services to improve company visibility
- **Marketing Advertisements**: Paid advertisement campaigns with admin approval
- **Direct Admin Communication**: All SEO and advertisement enquiries sent to admin email

### Admin Dashboard
Complete administrative control panel to manage:
- Companies (add, edit, delete)
- Reviews and ratings (approve, hide, delete)
- Advertisements (approve, reject, track payments)
- User enquiries (view, respond, track status)

## Technology Stack

- **Backend**: Flask 3.0, Python
- **Database**: SQLAlchemy with SQLite (can be upgraded to PostgreSQL/MySQL)
- **Authentication**: Flask-Login with Werkzeug password hashing
- **Email**: Flask-Mail for admin notifications
- **Frontend**: Bootstrap 5, Font Awesome icons
- **Security**: CSRF protection, secure password storage

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NCAS-SMARTDINE
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configurations:
   - Set a strong `SECRET_KEY`
   - Configure email settings (SMTP) for admin notifications
   - Set `ADMIN_EMAIL` for receiving service enquiries

5. **Initialize the database**
   ```bash
   python app.py
   ```
   
   This will:
   - Create the database tables
   - Create an admin user (username: `admin`, password: `admin123`)
   - Add sample companies

6. **Run the application**
   ```bash
   python app.py
   ```
   
   The application will be available at `http://localhost:5000`

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change the admin password immediately after first login!

## Usage Guide

### For Users
1. **Register**: Create an account on the registration page
2. **Search Companies**: Use the search bar to find companies by name or location
3. **View Details**: Click on any company to view full details and reviews
4. **Write Reviews**: Login and click "Write a Review" on company pages
5. **Contact Companies**: Use the contact form to send enquiries directly

### For Businesses
1. **Request Services**: Navigate to the Services page
2. **Choose Service Type**: Select SEO, Marketing, or both
3. **Submit Request**: Fill out the form with company details
4. **Admin Review**: Wait for admin team to contact you with pricing and details

### For Administrators
1. **Login**: Use admin credentials to access the admin panel
2. **Dashboard**: View statistics and quick actions
3. **Manage Companies**: Add, edit, or remove company listings
4. **Review Management**: Approve or hide user reviews
5. **Advertisement Control**: Approve/reject paid advertisement requests
6. **Enquiry Management**: View and respond to user enquiries

## Project Structure

```
NCAS-SMARTDINE/
├── app.py                  # Main application file
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── templates/            # HTML templates
│   ├── base.html        # Base template
│   ├── index.html       # Home page
│   ├── login.html       # Login page
│   ├── register.html    # Registration page
│   ├── companies.html   # Company listing
│   ├── company_detail.html  # Company details
│   ├── services.html    # Services page
│   └── admin/          # Admin templates
│       ├── dashboard.html
│       ├── companies.html
│       ├── add_company.html
│       ├── edit_company.html
│       ├── reviews.html
│       ├── advertisements.html
│       └── enquiries.html
└── static/             # Static files
    └── css/
        └── style.css   # Custom styles
```

## Database Models

- **User**: User accounts with authentication
- **Company**: Company information and details
- **Review**: User reviews and ratings for companies
- **Advertisement**: Paid advertisement requests
- **Enquiry**: Contact form submissions

## Security Features

- Password hashing using Werkzeug
- CSRF protection with Flask-WTF
- Secure session management with Flask-Login
- Input validation and sanitization
- Admin-only routes protection

## Email Configuration

To enable email notifications for admin:

1. Use Gmail SMTP (or any other provider)
2. For Gmail, create an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Update `.env` with credentials

## Production Deployment

For production deployment:

1. **Change SECRET_KEY**: Use a strong, random secret key
2. **Update Database**: Switch to PostgreSQL or MySQL
3. **Disable Debug Mode**: Set `debug=False` in app.run()
4. **Use Production Server**: Deploy with Gunicorn/uWSGI
5. **Configure HTTPS**: Use SSL/TLS certificates
6. **Environment Variables**: Use proper environment management
7. **Backup Strategy**: Implement regular database backups

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Note**: This is a comprehensive business application. Make sure to configure all security settings properly before deploying to production.