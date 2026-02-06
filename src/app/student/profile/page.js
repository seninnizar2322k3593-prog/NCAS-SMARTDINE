'use client'

/**
 * Student Profile Page
 * Displays student information and account settings
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentNav from '@/components/StudentNav'

export default function ProfilePage() {
  const router = useRouter()
  const [student, setStudent] = useState(null)

  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (user.type !== 'student') {
      router.push('/auth/login')
      return
    }

    setStudent(user)
  }, [router])

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN')
  }

  if (!student) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <StudentNav />
      
      <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

        {/* Profile Information Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: 'white'
            }}>
              👤
            </div>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>{student.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                Student ID: {student.student_id}
              </p>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: '2rem' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Full Name
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{student.name}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Student ID
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{student.student_id}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Date of Birth
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{formatDate(student.dob)}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Email
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{student.email || 'Not provided'}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Phone Number
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{student.phone || 'Not provided'}</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Account Created
              </h4>
              <p style={{ fontWeight: '600', marginBottom: 0 }}>{formatDate(student.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Account Settings</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Manage your account preferences and settings
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" disabled>
              Update Profile
            </button>
            <button className="btn btn-outline" disabled>
              Change Password
            </button>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            * These features will be available in a future update
          </p>
        </div>
      </div>
    </div>
  )
}
