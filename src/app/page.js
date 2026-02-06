/**
 * Home/Landing Page
 * This is the main entry point of the application
 */

import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            🍽️ NCAS SMART DINE
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            QR-Based College Canteen Pre-Order & Ticket Printing System
          </p>
          
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            <Link href="/auth/login" className="card" style={{ textDecoration: 'none', padding: '2rem' }}>
              <h3 style={{ color: 'var(--primary-color)' }}>👨‍🎓 Student Login</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Order food and manage your meals</p>
            </Link>
            
            <Link href="/auth/login" className="card" style={{ textDecoration: 'none', padding: '2rem' }}>
              <h3 style={{ color: 'var(--success-color)' }}>👨‍🍳 Admin Login</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Manage menu and orders</p>
            </Link>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <Link href="/scanner" className="card" style={{ textDecoration: 'none', padding: '2rem', display: 'block' }}>
              <h3 style={{ color: 'var(--warning-color)' }}>📷 QR Scanner</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Scan tickets and print receipts</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
