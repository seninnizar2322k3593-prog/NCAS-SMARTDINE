'use client'

/**
 * UPI Payment Page
 * Allows students to pay using UPI deep links (PhonePe, Google Pay, Paytm)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentNav from '@/components/StudentNav'

export default function PaymentPage() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [cart, setCart] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [orderCreated, setOrderCreated] = useState(false)

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

    // Get cart and total from sessionStorage
    const cartData = sessionStorage.getItem('cart')
    const totalData = sessionStorage.getItem('total')

    if (!cartData || !totalData) {
      alert('No items in cart. Redirecting to menu...')
      router.push('/student/menu')
      return
    }

    setCart(JSON.parse(cartData))
    setTotal(parseFloat(totalData))
  }, [router])

  // Generate UPI deep link
  const generateUPILink = (app) => {
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'merchant@upi'
    const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'NCAS Smart Dine'
    const amount = total.toFixed(2)
    const transactionNote = `Food Order - ${student?.name || 'Student'}`

    // UPI deep link format
    let upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`

    // App-specific deep links
    if (app === 'phonepe') {
      return `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    } else if (app === 'gpay') {
      return `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    } else if (app === 'paytm') {
      return `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    }

    return upiLink
  }

  // Handle payment initiation
  const handlePayment = async (app) => {
    setLoading(true)

    try {
      // Create order in database first
      const response = await fetch('/api/payment/create-upi-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.student_id,
          items: cart,
          total: total
        })
      })

      const result = await response.json()

      if (!result.success) {
        alert('Failed to create order. Please try again.')
        setLoading(false)
        return
      }

      // Mark order as created
      setOrderCreated(true)

      // Generate and open UPI deep link
      const upiLink = generateUPILink(app)
      window.location.href = upiLink

      // Give user time to complete payment, then redirect
      setTimeout(() => {
        alert('Payment initiated! Please complete the payment in your UPI app. Your order has been placed.')
        // Clear cart
        sessionStorage.removeItem('cart')
        sessionStorage.removeItem('total')
        router.push('/student/orders')
      }, 2000)

    } catch (err) {
      console.error('Payment error:', err)
      alert('Payment failed. Please try again.')
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
      
      <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '2rem' }}>Complete Payment</h1>

        {/* Order Summary */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Order Summary</h3>
          
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            {cart.map((item, index) => (
              <div key={index} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <strong>{item.name}</strong>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                    x{item.quantity}
                  </span>
                </div>
                <div style={{ fontWeight: '600' }}>
                  ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border-color)' }}>
            <h3>Total Amount:</h3>
            <h3 style={{ color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</h3>
          </div>
        </div>

        {/* UPI Payment Options */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Pay with UPI</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Choose your preferred UPI app to complete the payment
          </p>

          <div className="grid grid-3" style={{ gap: '1rem' }}>
            {/* PhonePe */}
            <button
              className="btn btn-outline"
              style={{ 
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                border: '2px solid #5f259f'
              }}
              onClick={() => handlePayment('phonepe')}
              disabled={loading || orderCreated}
            >
              <div style={{ fontSize: '3rem' }}>📱</div>
              <strong style={{ color: '#5f259f' }}>PhonePe</strong>
            </button>

            {/* Google Pay */}
            <button
              className="btn btn-outline"
              style={{ 
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                border: '2px solid #4285f4'
              }}
              onClick={() => handlePayment('gpay')}
              disabled={loading || orderCreated}
            >
              <div style={{ fontSize: '3rem' }}>💳</div>
              <strong style={{ color: '#4285f4' }}>Google Pay</strong>
            </button>

            {/* Paytm */}
            <button
              className="btn btn-outline"
              style={{ 
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                border: '2px solid #00baf2'
              }}
              onClick={() => handlePayment('paytm')}
              disabled={loading || orderCreated}
            >
              <div style={{ fontSize: '3rem' }}>💰</div>
              <strong style={{ color: '#00baf2' }}>Paytm</strong>
            </button>
          </div>

          {/* Other UPI Apps */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Or use any other UPI app
            </p>
            <button
              className="btn btn-primary"
              onClick={() => handlePayment('upi')}
              disabled={loading || orderCreated}
              style={{ width: '100%', maxWidth: '300px' }}
            >
              {loading ? 'Processing...' : 'Pay with UPI'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="alert alert-info" style={{ marginTop: '2rem' }}>
          <strong>Payment Instructions:</strong>
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
            <li>Click on your preferred UPI app button</li>
            <li>Complete the payment in the app</li>
            <li>Your order will be confirmed automatically</li>
            <li>You'll receive a QR code for order pickup</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
