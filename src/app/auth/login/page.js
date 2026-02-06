'use client'

/**
 * Login Page
 * Handles student and admin authentication
 * Students login with Student ID + DOB
 * Admins login with email + password
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/services/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loginType, setLoginType] = useState('student') // 'student' or 'admin'
  const [formData, setFormData] = useState({
    studentId: '',
    dob: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error on input change
  }

  // Handle student login
  const handleStudentLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate student credentials against Supabase
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', formData.studentId)
        .eq('dob', formData.dob)
        .single()

      if (error || !data) {
        setError('Invalid Student ID or Date of Birth')
        setLoading(false)
        return
      }

      // Store student session in localStorage
      localStorage.setItem('user', JSON.stringify({
        type: 'student',
        ...data
      }))

      // Redirect to student dashboard
      router.push('/student/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  // Handle admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Verify admin exists in database
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', formData.email)
        .single()

      if (adminError || !adminData) {
        setError('Invalid admin credentials')
        setLoading(false)
        return
      }

      // For simplicity, using Supabase auth for admin
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Store admin session
      localStorage.setItem('user', JSON.stringify({
        type: 'admin',
        ...adminData
      }))

      // Redirect to admin dashboard
      router.push('/admin/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>
            🍽️ NCAS SMART DINE
          </h1>

          {/* Login Type Toggle */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              className={`btn ${loginType === 'student' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
              onClick={() => setLoginType('student')}
            >
              Student Login
            </button>
            <button
              className={`btn ${loginType === 'admin' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1 }}
              onClick={() => setLoginType('admin')}
            >
              Admin Login
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Student Login Form */}
          {loginType === 'student' && (
            <form onSubmit={handleStudentLogin}>
              <div className="form-group">
                <label className="form-label">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-input"
                  placeholder="Enter your Student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Student'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link href="/auth/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                  Register here
                </Link>
              </p>
            </form>
          )}

          {/* Admin Login Form */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="admin@ncas.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login as Admin'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
