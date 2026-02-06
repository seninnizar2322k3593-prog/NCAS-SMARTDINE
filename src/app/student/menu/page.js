'use client'

/**
 * Student Menu Page
 * Displays available food items for today and tomorrow
 * Allows students to add items to cart and place orders
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StudentNav from '@/components/StudentNav'
import { supabase } from '@/services/supabase'

export default function MenuPage() {
  const router = useRouter()
  const [student, setStudent] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [cart, setCart] = useState([])
  const [selectedDate, setSelectedDate] = useState('today')
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
    loadMenu('today')
  }, [router])

  // Load menu items based on selected date
  const loadMenu = async (dateType) => {
    setLoading(true)
    try {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const targetDate = dateType === 'today' 
        ? today.toISOString().split('T')[0]
        : tomorrow.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('available_date', targetDate)
        .order('name')

      if (!error && data) {
        setMenuItems(data)
      }
    } catch (err) {
      console.error('Error loading menu:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle date selection change
  const handleDateChange = (dateType) => {
    setSelectedDate(dateType)
    loadMenu(dateType)
  }

  // Add item to cart
  const addToCart = (item) => {
    const existingItem = cart.find(c => c.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(c => 
        c.id === item.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const existingItem = cart.find(c => c.id === itemId)
    
    if (existingItem.quantity > 1) {
      setCart(cart.map(c => 
        c.id === itemId 
          ? { ...c, quantity: c.quantity - 1 }
          : c
      ))
    } else {
      setCart(cart.filter(c => c.id !== itemId))
    }
  }

  // Calculate total amount
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!')
      return
    }

    // Redirect to payment processing
    // Store cart in sessionStorage for payment page
    sessionStorage.setItem('cart', JSON.stringify(cart))
    sessionStorage.setItem('total', calculateTotal().toString())
    
    // Process payment through Razorpay
    await processPayment()
  }

  // Process payment with Razorpay
  const processPayment = async () => {
    try {
      const total = calculateTotal()
      
      // Create order on backend
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          studentId: student.student_id
        })
      })

      const { orderId, razorpayOrderId } = await response.json()

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: total * 100, // Amount in paise
          currency: 'INR',
          name: 'NCAS SMART DINE',
          description: 'Food Order Payment',
          order_id: razorpayOrderId,
          handler: async function (response) {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                studentId: student.student_id,
                items: cart,
                total: total
              })
            })

            const result = await verifyResponse.json()
            
            if (result.success) {
              alert('Payment successful! Order placed.')
              setCart([])
              router.push('/student/orders')
            } else {
              alert('Payment verification failed!')
            }
          },
          prefill: {
            name: student.name,
            email: student.email || '',
            contact: student.phone || ''
          },
          theme: {
            color: '#2563eb'
          }
        }

        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
      }
    } catch (err) {
      console.error('Payment error:', err)
      alert('Payment failed. Please try again.')
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
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h1>Menu</h1>
          
          {/* Date Selection */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className={`btn ${selectedDate === 'today' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleDateChange('today')}
            >
              Today's Menu
            </button>
            <button
              className={`btn ${selectedDate === 'tomorrow' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => handleDateChange('tomorrow')}
            >
              Tomorrow's Menu
            </button>
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No menu items available for {selectedDate}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Please check back later</p>
          </div>
        ) : (
          <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
            {menuItems.map((item) => (
              <div key={item.id} className="card">
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  🍽️
                </div>
                
                <h3>{item.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {item.description || 'Delicious food item'}
                </p>
                
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                      ₹{parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    {item.quantity > 0 ? (
                      <span className="badge badge-success">
                        {item.quantity} available
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        SOLD OUT
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => addToCart(item)}
                  disabled={item.quantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Shopping Cart */}
        {cart.length > 0 && (
          <div className="card" style={{ position: 'sticky', bottom: '1rem', background: 'var(--surface)', boxShadow: 'var(--shadow-xl)' }}>
            <h3>Shopping Cart ({cart.length} items)</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              {cart.map((item) => (
                <div key={item.id} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <strong>{item.name}</strong>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                      x{item.quantity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: '600' }}>
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      onClick={() => removeFromCart(item.id)}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3>Total:</h3>
              <h3 style={{ color: 'var(--primary-color)' }}>₹{calculateTotal().toFixed(2)}</h3>
            </div>

            <button
              className="btn btn-success"
              style={{ width: '100%' }}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
