from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['ADMIN_EMAIL'] = os.getenv('ADMIN_EMAIL', 'admin@companymarketstudy.com')

db = SQLAlchemy(app)
mail = Mail(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviews = db.relationship('Review', backref='author', lazy=True)
    enquiries = db.relationship('Enquiry', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(300))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    website = db.Column(db.String(200))
    category = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviews = db.relationship('Review', backref='company', lazy=True, cascade='all, delete-orphan')
    enquiries = db.relationship('Enquiry', backref='company', lazy=True, cascade='all, delete-orphan')
    advertisements = db.relationship('Advertisement', backref='company', lazy=True, cascade='all, delete-orphan')

    @property
    def average_rating(self):
        if not self.reviews:
            return 0
        return round(sum(review.rating for review in self.reviews) / len(self.reviews), 1)

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved = db.Column(db.Boolean, default=True)

class Advertisement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    ad_type = db.Column(db.String(50), nullable=False)  # 'SEO' or 'Marketing'
    duration_days = db.Column(db.Integer, default=30)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)

class Enquiry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    enquiry_type = db.Column(db.String(50), default='general')  # general, seo, advertisement
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='new')  # new, read, responded

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    search_query = request.args.get('search', '')
    location_query = request.args.get('location', '')
    
    query = Company.query
    if search_query:
        query = query.filter(Company.name.contains(search_query) | Company.description.contains(search_query))
    if location_query:
        query = query.filter(Company.city.contains(location_query) | Company.location.contains(location_query))
    
    companies = query.order_by(Company.created_at.desc()).limit(12).all()
    return render_template('index.html', companies=companies, search_query=search_query, location_query=location_query)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'danger')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'danger')
            return redirect(url_for('register'))
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash('Login successful!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page if next_page else url_for('index'))
        
        flash('Invalid username or password', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/companies')
def companies():
    search_query = request.args.get('search', '')
    location_query = request.args.get('location', '')
    category_query = request.args.get('category', '')
    
    query = Company.query
    if search_query:
        query = query.filter(Company.name.contains(search_query) | Company.description.contains(search_query))
    if location_query:
        query = query.filter(Company.city.contains(location_query) | Company.location.contains(location_query))
    if category_query:
        query = query.filter_by(category=category_query)
    
    companies = query.order_by(Company.created_at.desc()).all()
    categories = db.session.query(Company.category).distinct().all()
    categories = [c[0] for c in categories if c[0]]
    
    return render_template('companies.html', companies=companies, categories=categories, 
                         search_query=search_query, location_query=location_query, category_query=category_query)

@app.route('/company/<int:company_id>')
def company_detail(company_id):
    company = Company.query.get_or_404(company_id)
    reviews = Review.query.filter_by(company_id=company_id, approved=True).order_by(Review.created_at.desc()).all()
    return render_template('company_detail.html', company=company, reviews=reviews)

@app.route('/company/<int:company_id>/review', methods=['POST'])
@login_required
def add_review(company_id):
    company = Company.query.get_or_404(company_id)
    
    rating = int(request.form.get('rating'))
    title = request.form.get('title')
    content = request.form.get('content')
    
    review = Review(company_id=company_id, user_id=current_user.id, rating=rating, title=title, content=content)
    db.session.add(review)
    db.session.commit()
    
    flash('Review submitted successfully!', 'success')
    return redirect(url_for('company_detail', company_id=company_id))

@app.route('/company/<int:company_id>/contact', methods=['POST'])
def contact_company(company_id):
    company = Company.query.get_or_404(company_id)
    
    name = request.form.get('name')
    email = request.form.get('email')
    subject = request.form.get('subject')
    message = request.form.get('message')
    
    enquiry = Enquiry(
        company_id=company_id,
        user_id=current_user.id if current_user.is_authenticated else None,
        name=name,
        email=email,
        subject=subject,
        message=message,
        enquiry_type='general'
    )
    db.session.add(enquiry)
    db.session.commit()
    
    flash('Your enquiry has been sent successfully!', 'success')
    return redirect(url_for('company_detail', company_id=company_id))

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/services/request', methods=['POST'])
def request_service():
    service_type = request.form.get('service_type')
    company_name = request.form.get('company_name')
    contact_name = request.form.get('contact_name')
    contact_email = request.form.get('contact_email')
    message = request.form.get('message')
    
    # Send email to admin
    try:
        msg = Message(
            subject=f'New {service_type} Service Request from {company_name}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[app.config['ADMIN_EMAIL']],
            body=f"""
New service request received:

Service Type: {service_type}
Company Name: {company_name}
Contact Name: {contact_name}
Contact Email: {contact_email}

Message:
{message}

Please follow up with this enquiry.
            """
        )
        mail.send(msg)
        flash('Your service request has been sent to our team. We will contact you shortly.', 'success')
    except Exception as e:
        flash('Unable to send email at this time. Please try again later.', 'danger')
    
    return redirect(url_for('services'))

# Admin Routes
@app.route('/admin')
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    stats = {
        'total_companies': Company.query.count(),
        'total_users': User.query.count(),
        'total_reviews': Review.query.count(),
        'pending_ads': Advertisement.query.filter_by(status='pending').count(),
        'new_enquiries': Enquiry.query.filter_by(status='new').count()
    }
    
    return render_template('admin/dashboard.html', stats=stats)

@app.route('/admin/companies')
@login_required
def admin_companies():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    companies = Company.query.order_by(Company.created_at.desc()).all()
    return render_template('admin/companies.html', companies=companies)

@app.route('/admin/company/add', methods=['GET', 'POST'])
@login_required
def admin_add_company():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        company = Company(
            name=request.form.get('name'),
            description=request.form.get('description'),
            location=request.form.get('location'),
            city=request.form.get('city'),
            address=request.form.get('address'),
            phone=request.form.get('phone'),
            email=request.form.get('email'),
            website=request.form.get('website'),
            category=request.form.get('category')
        )
        db.session.add(company)
        db.session.commit()
        flash('Company added successfully!', 'success')
        return redirect(url_for('admin_companies'))
    
    return render_template('admin/add_company.html')

@app.route('/admin/company/<int:company_id>/edit', methods=['GET', 'POST'])
@login_required
def admin_edit_company(company_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    company = Company.query.get_or_404(company_id)
    
    if request.method == 'POST':
        company.name = request.form.get('name')
        company.description = request.form.get('description')
        company.location = request.form.get('location')
        company.city = request.form.get('city')
        company.address = request.form.get('address')
        company.phone = request.form.get('phone')
        company.email = request.form.get('email')
        company.website = request.form.get('website')
        company.category = request.form.get('category')
        db.session.commit()
        flash('Company updated successfully!', 'success')
        return redirect(url_for('admin_companies'))
    
    return render_template('admin/edit_company.html', company=company)

@app.route('/admin/company/<int:company_id>/delete', methods=['POST'])
@login_required
def admin_delete_company(company_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    company = Company.query.get_or_404(company_id)
    db.session.delete(company)
    db.session.commit()
    flash('Company deleted successfully!', 'success')
    return redirect(url_for('admin_companies'))

@app.route('/admin/reviews')
@login_required
def admin_reviews():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return render_template('admin/reviews.html', reviews=reviews)

@app.route('/admin/review/<int:review_id>/toggle', methods=['POST'])
@login_required
def admin_toggle_review(review_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    review = Review.query.get_or_404(review_id)
    review.approved = not review.approved
    db.session.commit()
    status = 'approved' if review.approved else 'hidden'
    flash(f'Review {status} successfully!', 'success')
    return redirect(url_for('admin_reviews'))

@app.route('/admin/review/<int:review_id>/delete', methods=['POST'])
@login_required
def admin_delete_review(review_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    review = Review.query.get_or_404(review_id)
    db.session.delete(review)
    db.session.commit()
    flash('Review deleted successfully!', 'success')
    return redirect(url_for('admin_reviews'))

@app.route('/admin/advertisements')
@login_required
def admin_advertisements():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    advertisements = Advertisement.query.order_by(Advertisement.created_at.desc()).all()
    return render_template('admin/advertisements.html', advertisements=advertisements)

@app.route('/admin/advertisement/<int:ad_id>/approve', methods=['POST'])
@login_required
def admin_approve_advertisement(ad_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    ad = Advertisement.query.get_or_404(ad_id)
    ad.status = 'approved'
    ad.approved_at = datetime.utcnow()
    db.session.commit()
    flash('Advertisement approved successfully!', 'success')
    return redirect(url_for('admin_advertisements'))

@app.route('/admin/advertisement/<int:ad_id>/reject', methods=['POST'])
@login_required
def admin_reject_advertisement(ad_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    ad = Advertisement.query.get_or_404(ad_id)
    ad.status = 'rejected'
    db.session.commit()
    flash('Advertisement rejected!', 'info')
    return redirect(url_for('admin_advertisements'))

@app.route('/admin/enquiries')
@login_required
def admin_enquiries():
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    enquiries = Enquiry.query.order_by(Enquiry.created_at.desc()).all()
    return render_template('admin/enquiries.html', enquiries=enquiries)

@app.route('/admin/enquiry/<int:enquiry_id>/mark-read', methods=['POST'])
@login_required
def admin_mark_enquiry_read(enquiry_id):
    if not current_user.is_admin:
        flash('Access denied. Admin privileges required.', 'danger')
        return redirect(url_for('index'))
    
    enquiry = Enquiry.query.get_or_404(enquiry_id)
    enquiry.status = 'read'
    db.session.commit()
    return redirect(url_for('admin_enquiries'))

def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', email='admin@companymarketstudy.com', is_admin=True)
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print('Admin user created: username=admin, password=admin123')
        
        # Create sample companies if none exist
        if Company.query.count() == 0:
            sample_companies = [
                Company(name='TechCorp Solutions', description='Leading technology solutions provider', 
                       location='Downtown Business District', city='New York', address='123 Tech Street',
                       phone='+1-555-0101', email='contact@techcorp.com', website='www.techcorp.com',
                       category='Technology'),
                Company(name='Green Earth Consulting', description='Environmental consulting and sustainability services',
                       location='Green Park Area', city='San Francisco', address='456 Eco Avenue',
                       phone='+1-555-0102', email='info@greenearth.com', website='www.greenearth.com',
                       category='Consulting'),
                Company(name='Finance Plus', description='Professional financial advisory services',
                       location='Financial District', city='Chicago', address='789 Money Lane',
                       phone='+1-555-0103', email='support@financeplus.com', website='www.financeplus.com',
                       category='Finance'),
                Company(name='HealthCare Pro', description='Quality healthcare and medical services',
                       location='Medical Center', city='Boston', address='321 Health Road',
                       phone='+1-555-0104', email='care@healthcarepro.com', website='www.healthcarepro.com',
                       category='Healthcare'),
                Company(name='EduLearn Academy', description='Online education and training platform',
                       location='Education Hub', city='Seattle', address='654 Learn Street',
                       phone='+1-555-0105', email='hello@edulearn.com', website='www.edulearn.com',
                       category='Education'),
                Company(name='Restaurant Delights', description='Fine dining and catering services',
                       location='Food District', city='Los Angeles', address='987 Cuisine Boulevard',
                       phone='+1-555-0106', email='reservations@restaurantdelights.com', website='www.restaurantdelights.com',
                       category='Food & Beverage'),
            ]
            db.session.add_all(sample_companies)
            db.session.commit()
            print(f'{len(sample_companies)} sample companies created')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
