'use client'

/**
 * Student Dashboard
 * Displays welcome message, quick stats, and navigation cards
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StudentNav from '@/components/StudentNav'
import { supabase } from '@/services/supabase'

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

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
    loadStats(user.student_id)
  }, [router])

  // Load student statistics
  const loadStats = async (studentId) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', studentId)

      if (!error && orders) {
        const totalOrders = orders.length
        const pendingOrders = orders.filter(o => !o.ticket_printed).length
        const completedOrders = orders.filter(o => o.ticket_printed).length
        const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalSpent
        })
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <StudentNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Welcome Section */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h1 style={{ color: 'white' }}>Welcome, {student.name}! 👋</h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Student ID: {student.student_id}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalOrders}</div>
            <div className="stats-label">Total Orders</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--warning-color)' }}>
              {stats.pendingOrders}
            </div>
            <div className="stats-label">Pending Orders</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--success-color)' }}>
              {stats.completedOrders}
            </div>
            <div className="stats-label">Completed</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--primary-color)' }}>
              ₹{stats.totalSpent.toFixed(2)}
            </div>
            <div className="stats-label">Total Spent</div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2>Quick Actions</h2>
        <div className="grid grid-3">
          <Link href="/student/menu" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <h3>Browse Menu</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Order food for today or tomorrow
              </p>
            </div>
          </Link>

          <Link href="/student/orders" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3>My Orders</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                View order history and QR codes
              </p>
            </div>
          </Link>

          <Link href="/student/profile" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
              <h3>My Profile</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                View and update your information
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
