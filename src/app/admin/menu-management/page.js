'use client'

/**
 * Admin Menu Management Page
 * CRUD operations for food items
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { supabase } from '@/services/supabase'

export default function MenuManagementPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    available_date: '',
    image: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (user.type !== 'admin') {
      router.push('/auth/login')
      return
    }

    setAdmin(user)
    loadMenuItems()
  }, [router])

  // Load all menu items
  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('available_date', { ascending: true })
        .order('name')

      if (!error && data) {
        setMenuItems(data)
      }
    } catch (err) {
      console.error('Error loading menu:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submission (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('food_items')
          .update({
            name: formData.name,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            description: formData.description,
            available_date: formData.available_date,
            image: formData.image
          })
          .eq('id', editingItem.id)

        if (error) throw error
        alert('Menu item updated successfully!')
      } else {
        // Add new item
        const { error } = await supabase
          .from('food_items')
          .insert([
            {
              name: formData.name,
              price: parseFloat(formData.price),
              quantity: parseInt(formData.quantity),
              description: formData.description,
              available_date: formData.available_date,
              image: formData.image
            }
          ])

        if (error) throw error
        alert('Menu item added successfully!')
      }

      // Reset form and reload items
      resetForm()
      loadMenuItems()
    } catch (err) {
      console.error('Error saving menu item:', err)
      alert('Failed to save menu item. Please try again.')
    }
  }

  // Start editing an item
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      description: item.description || '',
      available_date: item.available_date,
      image: item.image || ''
    })
    setShowForm(true)
  }

  // Delete an item
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Menu item deleted successfully!')
      loadMenuItems()
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item. Please try again.')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      description: '',
      available_date: '',
      image: ''
    })
    setEditingItem(null)
    setShowForm(false)
  }

  if (!admin) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <AdminNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h1>Menu Management</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add New Item'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Food Name *</label>
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
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity Available *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-input"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Date *</label>
                  <input
                    type="date"
                    name="available_date"
                    className="form-input"
                    value={formData.available_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the food item"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  name="image"
                  className="form-input"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success">
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items List */}
        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No menu items yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Click "Add New Item" to create your first menu item
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Available Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      {item.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td>₹{parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <span className={item.quantity < 10 ? 'badge badge-danger' : 'badge badge-success'}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td>{new Date(item.available_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      {item.quantity > 0 ? (
                        <span className="badge badge-success">Available</span>
                      ) : (
                        <span className="badge badge-danger">Sold Out</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
