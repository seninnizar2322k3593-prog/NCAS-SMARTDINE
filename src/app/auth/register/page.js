'use client'

/**
 * Student Registration Page
 * Allows new students to register in the system
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/services/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    dob: '',
    email: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if student ID already exists
      const { data: existingStudent } = await supabase
        .from('students')
        .select('student_id')
        .eq('student_id', formData.studentId)
        .single()

      if (existingStudent) {
        setError('Student ID already exists')
        setLoading(false)
        return
      }

      // Insert new student
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            student_id: formData.studentId,
            name: formData.name,
            dob: formData.dob,
            email: formData.email,
            phone: formData.phone
          }
        ])
        .select()

      if (error) {
        setError('Registration failed. Please try again.')
        setLoading(false)
        return
      }

      // Show success and redirect to login
      alert('Registration successful! Please login.')
      router.push('/auth/login')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
            Student Registration
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Create your account to order food
          </p>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Student ID *</label>
              <input
                type="text"
                name="studentId"
                className="form-input"
                placeholder="e.g., NCAS2024001"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="dob"
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="student@ncas.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                Login here
              </Link>
            </p>
          </form>

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
