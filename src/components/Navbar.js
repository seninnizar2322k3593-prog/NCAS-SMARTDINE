'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/authService';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const role = authService.getUserRole();

  const handleLogout = () => {
    authService.logout();
    router.push('/auth/login');
  };

  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/menu-management', label: 'Menu Management' },
        { href: '/admin/orders', label: 'Orders' },
        { href: '/admin/reports', label: 'Reports' },
        { href: '/scanner', label: 'Scanner' },
      ];
    } else {
      return [
        { href: '/student/dashboard', label: 'Dashboard' },
        { href: '/student/menu', label: 'Menu' },
        { href: '/student/orders', label: 'My Orders' },
        { href: '/student/profile', label: 'Profile' },
      ];
    }
  };

  if (!user) return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link href={role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className={styles.navBrand}>
          <Image 
            src="/ncas-logo.png" 
            alt="NCAS SMART DINE" 
            width={200} 
            height={60}
            className={styles.navLogo}
            priority
          />
        </Link>

        <div className={styles.navLinks}>
          {getNavLinks().map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.navUser}>
          <span className={styles.userName}>{user.name}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
