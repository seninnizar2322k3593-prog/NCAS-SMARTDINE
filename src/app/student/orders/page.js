'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/authService';
import { supabase } from '../../../utils/supabase';
import QRCode from 'qrcode';
import styles from '../../../styles/Orders.module.css';

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCheckout = searchParams.get('checkout') === 'true';
  const user = authService.getCurrentUser();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(isCheckout);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadOrders();
    if (isCheckout) {
      const cartData = sessionStorage.getItem('cart');
      const total = sessionStorage.getItem('cartTotal');
      if (cartData) {
        setCart(JSON.parse(cartData));
        setCartTotal(parseFloat(total || '0'));
      }
    }
  }, [isCheckout]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', user.student_id)
        .order('created_at', { ascending: false });

      if (!error) {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateUPILink = () => {
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'canteen@paytm';
    const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'College Canteen';
    const amount = cartTotal.toFixed(2);
    const orderId = `ORDER${Date.now()}`;
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
  };

  const handlePayment = async (method) => {
    setProcessingPayment(true);
    
    try {
      // Create order in database
      const orderData = {
        student_id: user.student_id,
        student_name: user.name,
        items: cart,
        total_amount: cartTotal,
        payment_method: method,
        payment_status: 'pending',
        status: 'pending',
        order_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Generate QR code for the order
      const qrData = JSON.stringify({
        orderId: newOrder.id,
        studentId: user.student_id,
        amount: cartTotal,
        timestamp: new Date().toISOString(),
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData);

      // Update order with QR code
      await supabase
        .from('orders')
        .update({ qr_code: qrCodeUrl })
        .eq('id', newOrder.id);

      // Open UPI payment link
      const upiLink = generateUPILink();
      window.location.href = upiLink;

      // Clear cart
      sessionStorage.removeItem('cart');
      sessionStorage.removeItem('cartTotal');
      
      // Simulate payment verification (in real app, this would be webhook-based)
      setTimeout(async () => {
        await supabase
          .from('orders')
          .update({ 
            payment_status: 'completed',
            status: 'confirmed'
          })
          .eq('id', newOrder.id);
        
        setShowPayment(false);
        loadOrders();
        router.push('/student/orders');
      }, 3000);

    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing order. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'Pending' },
      confirmed: { class: 'badge-primary', text: 'Confirmed' },
      preparing: { class: 'badge-primary', text: 'Preparing' },
      ready: { class: 'badge-success', text: 'Ready' },
      completed: { class: 'badge-success', text: 'Completed' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' },
    };
    
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const downloadQRCode = async (order) => {
    if (order.qr_code) {
      const link = document.createElement('a');
      link.href = order.qr_code;
      link.download = `order-${order.id}-qr.png`;
      link.click();
    }
  };

  if (showPayment && cart.length > 0) {
    return (
      <ProtectedRoute requiredRole="student">
        <div className={styles.ordersPage}>
          <div className="container">
            <div className={styles.paymentContainer}>
              <div className={styles.paymentCard}>
                <h2>Checkout</h2>
                
                <div className={styles.orderSummary}>
                  <h3>Order Summary</h3>
                  {cart.map((item, index) => (
                    <div key={index} className={styles.summaryItem}>
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className={styles.summaryTotal}>
                    <span>Total Amount:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                <div className={styles.paymentMethods}>
                  <h3>Select Payment Method</h3>
                  <div className={styles.paymentButtons}>
                    <button
                      className={styles.upiButton}
                      onClick={() => handlePayment('PhonePe')}
                      disabled={processingPayment}
                    >
                      <span style={{ fontSize: '2rem' }}>📱</span>
                      <span>PhonePe</span>
                    </button>
                    <button
                      className={styles.upiButton}
                      onClick={() => handlePayment('Google Pay')}
                      disabled={processingPayment}
                    >
                      <span style={{ fontSize: '2rem' }}>💳</span>
                      <span>Google Pay</span>
                    </button>
                    <button
                      className={styles.upiButton}
                      onClick={() => handlePayment('Paytm')}
                      disabled={processingPayment}
                    >
                      <span style={{ fontSize: '2rem' }}>💰</span>
                      <span>Paytm</span>
                    </button>
                  </div>
                  
                  {processingPayment && (
                    <div className="alert alert-warning mt-4">
                      <p>Processing your order... You will be redirected to payment.</p>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-outline mt-4"
                  onClick={() => {
                    setShowPayment(false);
                    router.push('/student/menu');
                  }}
                  style={{ width: '100%' }}
                >
                  Back to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className={styles.ordersPage}>
        <div className="container">
          <h1>My Orders</h1>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="loading"></div>
              <p>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>
              <span style={{ fontSize: '4rem' }}>📋</span>
              <h3>No orders yet</h3>
              <p>Start ordering from our menu</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => router.push('/student/menu')}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={`card ${styles.orderCard}`}>
                  <div className={styles.orderHeader}>
                    <div>
                      <div className={styles.orderId}>Order #{order.id}</div>
                      <div className={styles.orderDate}>
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    {order.items?.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderFooter}>
                    <div className={styles.orderTotal}>
                      <span>Total:</span>
                      <span>₹{order.total_amount}</span>
                    </div>
                    {order.qr_code && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => downloadQRCode(order)}
                      >
                        Download QR
                      </button>
                    )}
                  </div>

                  {order.qr_code && (
                    <div className={styles.qrCodeContainer}>
                      <img src={order.qr_code} alt="Order QR Code" />
                      <p className="text-sm text-secondary">
                        Show this QR code at the counter
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute requiredRole="student">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div className="loading"></div>
        </div>
      </ProtectedRoute>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
