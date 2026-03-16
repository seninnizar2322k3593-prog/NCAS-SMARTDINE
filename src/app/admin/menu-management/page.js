'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/MenuManagement.module.css';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    available_quantity: '',
    category: 'Main Course',
    image_url: '',
    available_date: new Date().toISOString().split('T')[0],
    is_available: true,
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setMenuItems(data || []);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        available_quantity: parseInt(formData.available_quantity),
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('Menu item updated successfully!');
      } else {
        // Add new item
        const { error } = await supabase
          .from('menu_items')
          .insert([{ ...itemData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert('Menu item added successfully!');
      }

      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item. Please try again.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      available_quantity: item.available_quantity.toString(),
      category: item.category || 'Main Course',
      image_url: item.image_url || '',
      available_date: item.available_date,
      is_available: item.is_available,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Menu item deleted successfully!');
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      available_quantity: '',
      category: 'Main Course',
      image_url: '',
      available_date: new Date().toISOString().split('T')[0],
      is_available: true,
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className={styles.menuManagement}>
        <div className="container">
          <div className={styles.header}>
            <h1>Menu Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? 'Cancel' : '+ Add Menu Item'}
            </button>
          </div>

          {showAddForm && (
            <div className={`card ${styles.formCard}`}>
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Item Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="Main Course">Main Course</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available Quantity *</label>
                    <input
                      type="number"
                      name="available_quantity"
                      className="form-input"
                      value={formData.available_quantity}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Available Date</label>
                    <input
                      type="date"
                      name="available_date"
                      className="form-input"
                      value={formData.available_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      className="form-input"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleChange}
                    />
                    <span>Available for ordering</span>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="loading"></div>
              <p>Loading menu items...</p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className={styles.emptyState}>
              <span style={{ fontSize: '4rem' }}>🍽️</span>
              <h3>No menu items yet</h3>
              <p>Add your first menu item to get started</p>
            </div>
          ) : (
            <div className={styles.menuGrid}>
              {menuItems.map((item) => (
                <div key={item.id} className={`card ${styles.menuItemCard}`}>
                  <div className={styles.menuItemImage}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span style={{ fontSize: '3rem' }}>🍽️</span>
                      </div>
                    )}
                    {!item.is_available && (
                      <div className={styles.unavailableBadge}>Unavailable</div>
                    )}
                  </div>
                  <div className={styles.menuItemContent}>
                    <h3>{item.name}</h3>
                    <span className="badge badge-primary">{item.category}</span>
                    {item.description && (
                      <p className={styles.description}>{item.description}</p>
                    )}
                    <div className={styles.itemDetails}>
                      <div className={styles.price}>₹{item.price}</div>
                      <div className={styles.quantity}>
                        Qty: {item.available_quantity}
                      </div>
                    </div>
                    <div className={styles.itemDate}>
                      Date: {new Date(item.available_date).toLocaleDateString()}
                    </div>
                    <div className={styles.itemActions}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
