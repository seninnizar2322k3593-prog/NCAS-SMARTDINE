'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/authService';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/Dashboard.module.css';

export default function StudentDashboard() {
  const router = useRouter();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      // Get total orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('student_id', user.student_id);

      if (!error && orders) {
        const pending = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
        const completed = orders.filter(o => o.status === 'completed').length;

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          completedOrders: completed,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Browse Menu',
      description: 'View today\'s and tomorrow\'s menu',
      icon: '🍽️',
      color: '#2563eb',
      href: '/student/menu',
    },
    {
      title: 'My Orders',
      description: 'View your order history',
      icon: '📋',
      color: '#10b981',
      href: '/student/orders',
    },
    {
      title: 'Profile',
      description: 'Manage your account',
      icon: '👤',
      color: '#f59e0b',
      href: '/student/profile',
    },
  ];

  return (
    <ProtectedRoute requiredRole="student">
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <div>
              <h1>Welcome back, {user?.name}! 👋</h1>
              <p>Student ID: {user?.student_id}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 mt-6">
            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                <span style={{ fontSize: '2rem' }}>📊</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {loading ? '...' : stats.totalOrders}
                </div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>
            </div>

            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {loading ? '...' : stats.pendingOrders}
                </div>
                <div className={styles.statLabel}>Pending Orders</div>
              </div>
            </div>

            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#d1fae5' }}>
                <span style={{ fontSize: '2rem' }}>✅</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {loading ? '...' : stats.completedOrders}
                </div>
                <div className={styles.statLabel}>Completed Orders</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className="grid grid-cols-3">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className={`card ${styles.actionCard}`}
                  onClick={() => router.push(action.href)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className={styles.actionIcon}
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <span style={{ fontSize: '3rem' }}>{action.icon}</span>
                  </div>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
