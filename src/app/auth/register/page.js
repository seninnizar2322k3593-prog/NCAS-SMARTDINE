'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../../services/authService';
import styles from '../../../styles/Auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    dob: '',
    department: '',
    year: '1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.studentId || !formData.name || !formData.email || !formData.phone || !formData.dob) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const result = await authService.register(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className="alert alert-success">
            <h3>Registration Successful!</h3>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>NCAS SMART DINE</h1>
          <p>Your Canteen Made Smarter</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <h2>Student Registration</h2>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              Student ID *
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              className="form-input"
              placeholder="Enter your student ID"
              value={formData.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dob" className="form-label">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              className="form-input"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department" className="form-label">
              Department
            </label>
            <select
              id="department"
              name="department"
              className="form-select"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year" className="form-label">
              Year
            </label>
            <select
              id="year"
              name="year"
              className="form-select"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>

          <div className={styles.authFooter}>
            <p>
              Already have an account?{' '}
              <Link href="/auth/login" className={styles.authLink}>
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
