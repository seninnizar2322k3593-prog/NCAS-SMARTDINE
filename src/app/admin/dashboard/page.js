'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/authService';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const user = authService.getCurrentUser();
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalMenuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get all orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Get today's orders
      const todayOrders = allOrders?.filter(o => 
        o.created_at?.startsWith(today)
      ) || [];

      // Get pending orders
      const pendingOrders = allOrders?.filter(o => 
        o.status === 'pending' || o.status === 'confirmed'
      ) || [];

      // Calculate revenue
      const totalRevenue = allOrders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Get menu items count
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*');

      setStats({
        totalOrders: allOrders?.length || 0,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        todayRevenue,
        totalMenuItems: menuItems?.length || 0,
      });

      // Set recent orders (last 5)
      setRecentOrders(allOrders?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Menu Management',
      description: 'Add or edit menu items',
      icon: '📋',
      color: '#2563eb',
      href: '/admin/menu-management',
    },
    {
      title: 'View Orders',
      description: 'Manage all orders',
      icon: '🛒',
      color: '#10b981',
      href: '/admin/orders',
    },
    {
      title: 'Reports',
      description: 'View sales reports',
      icon: '📊',
      color: '#f59e0b',
      href: '/admin/reports',
    },
    {
      title: 'Scanner',
      description: 'Scan order QR codes',
      icon: '📱',
      color: '#8b5cf6',
      href: '/scanner',
    },
  ];

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
      <div className={styles.dashboard}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <div>
              <h1>Admin Dashboard 👋</h1>
              <p>Welcome back, {user?.name}</p>
            </div>
          </div>

          {/* Stats Grid */}
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
                <span style={{ fontSize: '2rem' }}>🔔</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {loading ? '...' : stats.todayOrders}
                </div>
                <div className={styles.statLabel}>Today's Orders</div>
              </div>
            </div>

            <div className={`card ${styles.statCard}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2' }}>
                <span style={{ fontSize: '2rem' }}>⏳</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {loading ? '...' : stats.pendingOrders}
                </div>
                <div className={styles.statLabel}>Pending Orders</div>
              </div>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-2 mt-4">
            <div className={`card ${styles.revenueCard}`}>
              <div className={styles.revenueIcon}>💰</div>
              <div className={styles.revenueContent}>
                <div className={styles.revenueLabel}>Total Revenue</div>
                <div className={styles.revenueValue}>
                  ₹{loading ? '...' : stats.totalRevenue.toFixed(2)}
                </div>
              </div>
            </div>

            <div className={`card ${styles.revenueCard}`}>
              <div className={styles.revenueIcon}>📈</div>
              <div className={styles.revenueContent}>
                <div className={styles.revenueLabel}>Today's Revenue</div>
                <div className={styles.revenueValue}>
                  ₹{loading ? '...' : stats.todayRevenue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className="grid grid-cols-4">
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
                    <span style={{ fontSize: '2.5rem' }}>{action.icon}</span>
                  </div>
                  <h3 className={styles.actionTitle}>{action.title}</h3>
                  <p className={styles.actionDescription}>{action.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className="loading"></div>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>No recent orders</p>
              </div>
            ) : (
              <div className="card" style={{ padding: '1rem' }}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.student_name}</td>
                        <td>₹{order.total_amount}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
