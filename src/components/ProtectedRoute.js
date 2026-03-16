'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import Navbar from './Navbar';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const user = authService.getCurrentUser();
    const userRole = authService.getUserRole();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      router.push(userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [router, requiredRole]);

  // Always show loading during SSR and initial client render
  if (!isClient) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  const user = authService.getCurrentUser();

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px)' }}>
        {children}
      </main>
    </>
  );
}
