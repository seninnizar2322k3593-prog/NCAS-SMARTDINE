'use client'

/**
 * QR Scanner Page
 * Scans QR codes and prints tickets for orders
 */

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import Link from 'next/link'

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [orderDetails, setOrderDetails] = useState(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  // Start QR code scanning
  const startScanning = async () => {
    try {
      setError('')
      setResult(null)
      setOrderDetails(null)

      const html5QrCode = new Html5Qrcode('qr-reader')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        async (decodedText) => {
          // Stop scanning after successful read
          await html5QrCode.stop()
          setScanning(false)
          
          // Process the scanned order ID
          await handleQRScan(decodedText)
        },
        (errorMessage) => {
          // Handle scan errors (can be ignored for continuous scanning)
        }
      )

      setScanning(true)
    } catch (err) {
      console.error('Scanner error:', err)
      setError('Failed to start camera. Please ensure camera permissions are granted.')
    }
  }

  // Stop scanning
  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        setScanning(false)
      } catch (err) {
        console.error('Stop error:', err)
      }
    }
  }

  // Handle QR scan result
  const handleQRScan = async (orderId) => {
    try {
      setResult(orderId)

      // Validate order with backend
      const response = await fetch('/api/scanner/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Invalid QR code')
        return
      }

      // Store order details and trigger print
      setOrderDetails(data.order)
      
      // Trigger print dialog after a short delay
      setTimeout(() => {
        window.print()
      }, 500)
    } catch (err) {
      console.error('Validation error:', err)
      setError('Failed to validate order. Please try again.')
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="card" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--warning-color)' }}>📷 QR Scanner</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Scan customer QR codes to validate and print tickets
          </p>
          <Link href="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Home
          </Link>
        </div>

        {/* Scanner Controls */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            {!scanning ? (
              <button
                className="btn btn-success"
                onClick={startScanning}
                style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
              >
                Start Scanning
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={stopScanning}
                style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
              >
                Stop Scanning
              </button>
            )}
          </div>

          {/* Scanner View */}
          <div
            id="qr-reader"
            style={{
              marginTop: '2rem',
              width: '100%',
              maxWidth: '500px',
              margin: '2rem auto 0',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}
          ></div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {result && !error && (
            <div className="alert alert-success" style={{ marginTop: '1rem' }}>
              ✅ QR Code scanned successfully: {result}
            </div>
          )}
        </div>

        {/* Order Details for Printing */}
        {orderDetails && (
          <div className="card print-ticket">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2>NCAS SMART DINE</h2>
              <p style={{ borderTop: '2px dashed var(--border-color)', borderBottom: '2px dashed var(--border-color)', padding: '0.5rem 0', margin: '1rem 0' }}>
                FOOD ORDER TICKET
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Order ID:</strong> #{orderDetails.order_id}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Student:</strong> {orderDetails.studentName}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <strong>Date & Time:</strong> {formatDate(orderDetails.created_at)}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <strong>Food Items:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {orderDetails.items && Array.isArray(orderDetails.items) && orderDetails.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.25rem' }}>
              <strong>Total Amount: ₹{parseFloat(orderDetails.total_amount).toFixed(2)}</strong>
            </div>

            <div style={{ borderTop: '2px dashed var(--border-color)', marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Thank you for using NCAS SMART DINE!
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-ticket,
          .print-ticket * {
            visibility: visible;
          }
          .print-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 80mm;
            padding: 10mm;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}
