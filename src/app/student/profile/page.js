'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/authService';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/Profile.module.css';

export default function ProfilePage() {
  const user = authService.getCurrentUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    year: user?.year || '1',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          year: formData.year,
        })
        .eq('student_id', user.student_id);

      if (error) throw error;

      // Update local storage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className={styles.profilePage}>
        <div className="container">
          <h1>My Profile</h1>

          <div className={styles.profileContent}>
            <div className={`card ${styles.profileCard}`}>
              <div className={styles.profileHeader}>
                <div className={styles.profileAvatar}>
                  <span style={{ fontSize: '4rem' }}>👤</span>
                </div>
                <div className={styles.profileInfo}>
                  <h2>{user?.name}</h2>
                  <p>Student ID: {user?.student_id}</p>
                  <p>DOB: {user?.dob}</p>
                </div>
              </div>

              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    name="year"
                    className="form-select"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={!editing}
                  >
                    <option value="1">First Year</option>
                    <option value="2">Second Year</option>
                    <option value="3">Third Year</option>
                    <option value="4">Fourth Year</option>
                  </select>
                </div>

                <div className={styles.profileActions}>
                  {editing ? (
                    <>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditing(false);
                          setFormData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                            department: user?.department || '',
                            year: user?.year || '1',
                          });
                          setMessage({ type: '', text: '' });
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditing(true);
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className={`card ${styles.infoCard}`}>
              <h3>Account Information</h3>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Account Type:</span>
                <span className={styles.infoValue}>Student</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member Since:</span>
                <span className={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
