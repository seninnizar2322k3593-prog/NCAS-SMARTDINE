'use client'

/**
 * Admin Navigation Component
 * Provides navigation menu for admin pages
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/menu-management', label: 'Menu Management', icon: '🍽️' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' }
  ]

  return (
    <nav className="nav">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <h3 style={{ color: 'var(--success-color)', margin: 0 }}>👨‍🍳 Admin Panel</h3>
          </Link>
          <ul className="nav-links" style={{ margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={handleLogout} className="btn btn-danger" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}
