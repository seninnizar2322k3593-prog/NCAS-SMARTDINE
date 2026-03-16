'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { supabase } from '../../utils/supabase';
import styles from '../../styles/Scanner.module.css';

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualOrderId, setManualOrderId] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import html5-qrcode only on client side
    if (typeof window !== 'undefined' && scanning) {
      import('html5-qrcode').then((module) => {
        const Html5Qrcode = module.Html5Qrcode;
        
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode('qr-reader');
        }

        const qrCodeSuccessCallback = (decodedText) => {
          handleScan(decodedText);
          stopScanning();
        };

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCodeRef.current
          .start(
            { facingMode: 'environment' },
            config,
            qrCodeSuccessCallback
          )
          .then(() => {
            if (isMounted) {
              setScannerRunning(true);
            }
          })
          .catch((err) => {
            console.error('Error starting scanner:', err);
            if (isMounted) {
              setError('Failed to start camera. Please check permissions.');
              setScanning(false);
            }
          });
      });
    }

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        const scanner = html5QrCodeRef.current;
        // Check if scanner is actually scanning before stopping
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              setScannerRunning(false);
            })
            .catch((err) => {
              console.log('Scanner cleanup error (safe to ignore):', err);
            });
        }
      }
    };
  }, [scanning]);

  const startScanning = () => {
    setScanning(true);
    setError('');
    setSuccess('');
    setScannedOrder(null);
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          setScannerRunning(false);
          setScanning(false);
        })
        .catch((err) => {
          console.log('Stop scanner error (safe to ignore):', err);
          setScannerRunning(false);
          setScanning(false);
        });
    } else {
      setScanning(false);
      setScannerRunning(false);
    }
  };

  const handleScan = async (data) => {
    try {
      const qrData = JSON.parse(data);
      const orderId = qrData.orderId;

      // Fetch order from database
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        setError('Order not found');
        return;
      }

      setScannedOrder(order);
      setSuccess('Order scanned successfully!');
    } catch (err) {
      setError('Invalid QR code');
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setScannedOrder(null);

    if (!manualOrderId) {
      setError('Please enter an order ID');
      return;
    }

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', parseInt(manualOrderId))
        .single();

      if (error || !order) {
        setError('Order not found');
        return;
      }

      setScannedOrder(order);
      setSuccess('Order found!');
    } catch (err) {
      setError('Error looking up order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setScannedOrder({ ...scannedOrder, status: newStatus });
      setSuccess(`Order status updated to ${newStatus}!`);
    } catch (err) {
      setError('Failed to update order status');
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

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={styles.scannerPage}>
        <div className="container">
          <h1>QR Code Scanner</h1>

          <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
            {/* Scanner Section */}
            <div className={`card ${styles.scannerCard}`}>
              <h2>Scan QR Code</h2>
              
              {!scanning ? (
                <div className={styles.scannerPlaceholder}>
                  <span style={{ fontSize: '5rem' }}>📱</span>
                  <p>Click the button below to start scanning</p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={startScanning}
                  >
                    Start Scanner
                  </button>
                </div>
              ) : (
                <div className={styles.scannerContainer}>
                  <div id="qr-reader" ref={scannerRef}></div>
                  <button
                    className="btn btn-danger mt-4"
                    onClick={stopScanning}
                    style={{ width: '100%' }}
                  >
                    Stop Scanner
                  </button>
                </div>
              )}

              {/* Manual Lookup */}
              <div className={styles.manualLookup}>
                <h3>Manual Order Lookup</h3>
                <form onSubmit={handleManualLookup}>
                  <div className={styles.manualLookupForm}>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter Order ID"
                      value={manualOrderId}
                      onChange={(e) => setManualOrderId(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                      Lookup
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Details Section */}
            <div className={`card ${styles.orderDetailsCard}`}>
              <h2>Order Details</h2>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {!scannedOrder && !error && !success && (
                <div className={styles.noOrderPlaceholder}>
                  <span style={{ fontSize: '4rem' }}>🔍</span>
                  <p>Scan a QR code or enter an order ID to view details</p>
                </div>
              )}

              {scannedOrder && (
                <div className={styles.orderDetails}>
                  <div className={styles.orderHeader}>
                    <div>
                      <div className={styles.orderId}>Order #{scannedOrder.id}</div>
                      <div className={styles.orderDate}>
                        {new Date(scannedOrder.created_at).toLocaleString()}
                      </div>
                    </div>
                    {getStatusBadge(scannedOrder.status)}
                  </div>

                  <div className={styles.orderInfo}>
                    <div className={styles.infoRow}>
                      <span>Student Name:</span>
                      <span>{scannedOrder.student_name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>Student ID:</span>
                      <span>{scannedOrder.student_id}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>Payment Method:</span>
                      <span>{scannedOrder.payment_method || 'UPI'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>Payment Status:</span>
                      <span className={scannedOrder.payment_status === 'completed' ? 'text-success' : 'text-warning'}>
                        {scannedOrder.payment_status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    <h4>Items:</h4>
                    {scannedOrder.items?.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderTotal}>
                    <span>Total Amount:</span>
                    <span>₹{scannedOrder.total_amount}</span>
                  </div>

                  <div className={styles.statusActions}>
                    <h4>Update Status:</h4>
                    <div className={styles.statusButtons}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateOrderStatus(scannedOrder.id, 'confirmed')}
                        disabled={scannedOrder.status === 'completed'}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateOrderStatus(scannedOrder.id, 'completed')}
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
