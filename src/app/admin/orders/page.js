'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/AdminOrders.module.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
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

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id?.toString().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
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

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={styles.ordersPage}>
        <div className="container">
          <h1>Orders Management</h1>

          {/* Filters */}
          <div className={`card ${styles.filtersCard}`}>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label className="form-label">Filter by Status:</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className="form-label">Search:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by student name, ID, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="loading"></div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <span style={{ fontSize: '4rem' }}>📋</span>
              <h3>No orders found</h3>
              <p>No orders match your current filters</p>
            </div>
          ) : (
            <div className={styles.ordersGrid}>
              {filteredOrders.map((order) => (
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

                  <div className={styles.orderInfo}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Student:</span>
                      <span className={styles.infoValue}>{order.student_name}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Student ID:</span>
                      <span className={styles.infoValue}>{order.student_id}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Payment:</span>
                      <span className={styles.infoValue}>{order.payment_method || 'UPI'}</span>
                    </div>
                  </div>

                  <div className={styles.orderItems}>
                    <strong>Items:</strong>
                    {order.items?.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.orderTotal}>
                    <span>Total:</span>
                    <span>₹{order.total_amount}</span>
                  </div>

                  <div className={styles.orderActions}>
                    <label className="form-label">Update Status:</label>
                    <select
                      className="form-select"
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {order.qr_code && (
                    <div className={styles.qrCodeContainer}>
                      <img src={order.qr_code} alt="Order QR Code" />
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
