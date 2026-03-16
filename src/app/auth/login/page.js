'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../../services/authService';
import styles from '../../../styles/Auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentId: '',
    dob: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    if (!formData.studentId || !formData.dob) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await authService.login(formData.studentId, formData.dob);

    if (result.success) {
      const role = result.user.role || 'student';
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>NCAS SMART DINE</h1>
          <p>Your Canteen Made Smarter</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <h2>Student Login</h2>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              👤 Student ID
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
            <label htmlFor="dob" className="form-label">
              📅 Date of Birth
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

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className={styles.authFooter}>
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register" className={styles.authLink}>
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
