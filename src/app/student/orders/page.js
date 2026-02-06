'use client'

/**
 * Student Orders Page
 * Displays order history with QR codes for each order
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentNav from '@/components/StudentNav'
import { supabase } from '@/services/supabase'

export default function OrdersPage() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'completed'
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
    loadOrders(user.student_id)
  }, [router])

  // Load student orders
  const loadOrders = async (studentId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', studentId)
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

  // Filter orders based on selected filter
  const getFilteredOrders = () => {
    if (filter === 'all') return orders
    if (filter === 'pending') return orders.filter(o => !o.ticket_printed)
    if (filter === 'completed') return orders.filter(o => o.ticket_printed)
    return orders
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

  if (!student) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <StudentNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h1>My Orders</h1>
          
          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No orders found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {filter === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${filter} orders found`
              }
            </p>
            <a href="/student/menu" className="btn btn-primary">
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="grid grid-2">
            {filteredOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>Order #{order.order_id}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 0 }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    {order.ticket_printed ? (
                      <span className="badge badge-success">Completed</span>
                    ) : order.payment_status === 'paid' ? (
                      <span className="badge badge-warning">Pending Pickup</span>
                    ) : (
                      <span className="badge badge-danger">Payment Failed</span>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Items:</h4>
                  {order.items && typeof order.items === 'object' && (
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {Array.isArray(order.items) ? order.items.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.875rem' }}>
                          {item.name} x {item.quantity} - ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </li>
                      )) : null}
                    </ul>
                  )}
                </div>

                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <strong>Total Amount:</strong>
                  <strong style={{ color: 'var(--primary-color)', fontSize: '1.25rem' }}>
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </strong>
                </div>

                {/* QR Code */}
                {order.payment_status === 'paid' && order.qr_data && (
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Show this QR at counter
                    </p>
                    <img
                      src={order.qr_data}
                      alt={`QR Code for order ${order.order_id}`}
                      style={{ width: '200px', height: '200px', margin: '0 auto' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Order ID: {order.order_id}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
