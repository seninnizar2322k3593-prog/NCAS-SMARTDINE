'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/Reports.module.css';

export default function Reports() {
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    topItems: [],
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      // Get all orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Filter orders by date range
      let filteredOrders = allOrders || [];
      if (dateRange === 'today') {
        filteredOrders = filteredOrders.filter(o => o.created_at?.startsWith(today));
      } else if (dateRange === 'week') {
        filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= weekAgo);
      } else if (dateRange === 'month') {
        filteredOrders = filteredOrders.filter(o => new Date(o.created_at) >= monthAgo);
      }

      // Calculate revenue
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const todayOrders = allOrders?.filter(o => o.created_at?.startsWith(today)) || [];
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const weekOrders = allOrders?.filter(o => new Date(o.created_at) >= weekAgo) || [];
      const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const monthOrders = allOrders?.filter(o => new Date(o.created_at) >= monthAgo) || [];
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Calculate top items
      const itemCount = {};
      filteredOrders.forEach(order => {
        order.items?.forEach(item => {
          if (itemCount[item.name]) {
            itemCount[item.name] += item.quantity;
          } else {
            itemCount[item.name] = item.quantity;
          }
        });
      });

      const topItems = Object.entries(itemCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setReportData({
        totalOrders: filteredOrders.length,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        topItems,
        recentOrders: filteredOrders.slice(0, 10),
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
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
      <div className={styles.reportsPage}>
        <div className="container">
          <div className={styles.header}>
            <h1>Sales Reports</h1>
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="loading"></div>
              <p>Loading reports...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4">
                <div className={`card ${styles.statCard}`}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                    <span style={{ fontSize: '2rem' }}>📊</span>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{reportData.totalOrders}</div>
                    <div className={styles.statLabel}>Total Orders</div>
                  </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#d1fae5' }}>
                    <span style={{ fontSize: '2rem' }}>💰</span>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>₹{reportData.totalRevenue.toFixed(2)}</div>
                    <div className={styles.statLabel}>Total Revenue</div>
                  </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                    <span style={{ fontSize: '2rem' }}>📅</span>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>{reportData.todayOrders}</div>
                    <div className={styles.statLabel}>Today's Orders</div>
                  </div>
                </div>

                <div className={`card ${styles.statCard}`}>
                  <div className={styles.statIcon} style={{ backgroundColor: '#e0e7ff' }}>
                    <span style={{ fontSize: '2rem' }}>💵</span>
                  </div>
                  <div className={styles.statContent}>
                    <div className={styles.statValue}>₹{reportData.todayRevenue.toFixed(2)}</div>
                    <div className={styles.statLabel}>Today's Revenue</div>
                  </div>
                </div>
              </div>

              {/* Revenue Timeline */}
              <div className={`card ${styles.revenueCard}`}>
                <h2>Revenue Overview</h2>
                <div className={styles.revenueGrid}>
                  <div className={styles.revenueItem}>
                    <div className={styles.revenueLabel}>Last 7 Days</div>
                    <div className={styles.revenueValue}>₹{reportData.weekRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.revenueItem}>
                    <div className={styles.revenueLabel}>Last 30 Days</div>
                    <div className={styles.revenueValue}>₹{reportData.monthRevenue.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2" style={{ marginTop: '2rem' }}>
                {/* Top Items */}
                <div className={`card ${styles.topItemsCard}`}>
                  <h2>Top Selling Items</h2>
                  {reportData.topItems.length === 0 ? (
                    <p className="text-secondary">No data available</p>
                  ) : (
                    <div className={styles.topItemsList}>
                      {reportData.topItems.map((item, index) => (
                        <div key={index} className={styles.topItem}>
                          <div className={styles.topItemRank}>#{index + 1}</div>
                          <div className={styles.topItemName}>{item.name}</div>
                          <div className={styles.topItemCount}>{item.count} sold</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className={`card ${styles.recentOrdersCard}`}>
                  <h2>Recent Orders</h2>
                  {reportData.recentOrders.length === 0 ? (
                    <p className="text-secondary">No orders yet</p>
                  ) : (
                    <div className={styles.ordersList}>
                      {reportData.recentOrders.map((order) => (
                        <div key={order.id} className={styles.orderItem}>
                          <div className={styles.orderItemInfo}>
                            <div className={styles.orderItemId}>#{order.id}</div>
                            <div className={styles.orderItemStudent}>{order.student_name}</div>
                          </div>
                          <div className={styles.orderItemRight}>
                            <div className={styles.orderItemAmount}>₹{order.total_amount}</div>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
