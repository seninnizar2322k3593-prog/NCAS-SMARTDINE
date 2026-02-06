'use client'

/**
 * Admin Orders Page
 * View and manage all orders
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { supabase } from '@/services/supabase'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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
    loadOrders()
  }, [router])

  // Load all orders
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data)
      }
    } catch (err) {
      console.error('Error loading orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders
  const getFilteredOrders = () => {
    let filtered = orders

    // Filter by status
    if (filter === 'printed') {
      filtered = filtered.filter(o => o.ticket_printed)
    } else if (filter === 'unprinted') {
      filtered = filtered.filter(o => !o.ticket_printed && o.payment_status === 'paid')
    } else if (filter === 'paid') {
      filtered = filtered.filter(o => o.payment_status === 'paid')
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter(o => 
        o.created_at.startsWith(dateFilter)
      )
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.student_id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
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

  const filteredOrders = getFilteredOrders()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <AdminNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Orders Management</h1>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Filter */}
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Filter by Status</label>
              <select
                className="form-input"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="paid">Paid Orders</option>
                <option value="printed">Tickets Printed</option>
                <option value="unprinted">Pending Pickup</option>
              </select>
            </div>

            {/* Date Filter */}
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Filter by Date</label>
              <input
                type="date"
                className="form-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Search */}
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Order ID or Student ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div style={{ flex: '0 0 auto', paddingTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setFilter('all')
                  setDateFilter('')
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No orders found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Student ID</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Ticket</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.order_id}</strong></td>
                    <td>{order.student_id}</td>
                    <td>
                      {order.items && Array.isArray(order.items) ? (
                        <div style={{ fontSize: '0.875rem' }}>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx}>• {item.name} x{item.quantity}</div>
                          ))}
                          {order.items.length > 2 && (
                            <div style={{ color: 'var(--text-secondary)' }}>
                              +{order.items.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>No items</span>
                      )}
                    </td>
                    <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>
                      {order.payment_status === 'paid' ? (
                        <span className="badge badge-success">Paid</span>
                      ) : (
                        <span className="badge badge-danger">Failed</span>
                      )}
                    </td>
                    <td>
                      {order.ticket_printed ? (
                        <span className="badge badge-success">Printed</span>
                      ) : order.payment_status === 'paid' ? (
                        <span className="badge badge-warning">Pending</span>
                      ) : (
                        <span className="badge badge-info">N/A</span>
                      )}
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Summary</h3>
          <div className="grid grid-3">
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Orders</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 0 }}>
                {filteredOrders.length}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Revenue</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)', marginBottom: 0 }}>
                ₹{filteredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Completion Rate</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: 0 }}>
                {filteredOrders.length > 0 
                  ? Math.round((filteredOrders.filter(o => o.ticket_printed).length / filteredOrders.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
