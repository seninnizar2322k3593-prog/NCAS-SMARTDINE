'use client'

/**
 * Admin Dashboard
 * Displays analytics and statistics for admin
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { supabase } from '@/services/supabase'

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    ticketsPrinted: 0,
    ticketsUnprinted: 0,
    todayRevenue: 0,
    totalFoodItems: 0,
    lowStockItems: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (user.type !== 'admin') {
      router.push('/auth/login')
      return
    }

    setAdmin(user)
    loadDashboardData()
  }, [router])

  // Load dashboard statistics
  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get today's orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today)

      // Calculate stats
      const totalOrdersToday = orders?.length || 0
      const ticketsPrinted = orders?.filter(o => o.ticket_printed).length || 0
      const ticketsUnprinted = orders?.filter(o => !o.ticket_printed && o.payment_status === 'paid').length || 0
      const todayRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0

      // Get food items stats
      const { data: foodItems } = await supabase
        .from('food_items')
        .select('*')

      const totalFoodItems = foodItems?.length || 0
      const lowStockItems = foodItems?.filter(f => f.quantity < 10).length || 0

      setStats({
        totalOrdersToday,
        ticketsPrinted,
        ticketsUnprinted,
        todayRevenue,
        totalFoodItems,
        lowStockItems
      })

      // Get recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentOrders(recent || [])
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!admin) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <AdminNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Welcome Section */}
        <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
          <h1 style={{ color: 'white' }}>Admin Dashboard 👨‍🍳</h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <h2>Today's Overview</h2>
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalOrdersToday}</div>
            <div className="stats-label">Total Orders Today</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--success-color)' }}>
              {stats.ticketsPrinted}
            </div>
            <div className="stats-label">Tickets Printed</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--warning-color)' }}>
              {stats.ticketsUnprinted}
            </div>
            <div className="stats-label">Pending Pickup</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--primary-color)' }}>
              ₹{stats.todayRevenue.toFixed(2)}
            </div>
            <div className="stats-label">Today's Revenue</div>
          </div>
        </div>

        {/* Inventory Stats */}
        <h2>Inventory Status</h2>
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stats-card">
            <div className="stats-number">{stats.totalFoodItems}</div>
            <div className="stats-label">Total Menu Items</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--danger-color)' }}>
              {stats.lowStockItems}
            </div>
            <div className="stats-label">Low Stock Alerts</div>
          </div>

          <div className="stats-card">
            <div className="stats-number" style={{ color: 'var(--success-color)' }}>
              {stats.totalFoodItems - stats.lowStockItems}
            </div>
            <div className="stats-label">Well Stocked</div>
          </div>
        </div>

        {/* Recent Orders */}
        <h2>Recent Orders</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Student ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.order_id}</strong></td>
                    <td>{order.student_id}</td>
                    <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      {order.ticket_printed ? (
                        <span className="badge badge-success">Completed</span>
                      ) : order.payment_status === 'paid' ? (
                        <span className="badge badge-warning">Pending</span>
                      ) : (
                        <span className="badge badge-danger">Failed</span>
                      )}
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
