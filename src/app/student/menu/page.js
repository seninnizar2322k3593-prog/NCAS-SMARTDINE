'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { authService } from '../../../services/authService';
import { supabase } from '../../../utils/supabase';
import styles from '../../../styles/Menu.module.css';

export default function MenuPage() {
  const router = useRouter();
  const user = authService.getCurrentUser();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('today');

  useEffect(() => {
    loadMenu();
  }, [selectedDate]);

  const loadMenu = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const targetDate = selectedDate === 'today' ? today : tomorrow;

      // First, try to get items for the specific date
      let { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available_date', targetDate)
        .eq('is_available', true);

      // If no items found for specific date, get all available items
      if (!error && (!data || data.length === 0)) {
        const fallback = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true);
        
        if (!fallback.error) {
          data = fallback.data;
        }
      }

      if (!error) {
        setMenuItems(data || []);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity < item.available_quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemInCart = (itemId) => {
    return cart.find(item => item.id === itemId);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }
    // Store cart in sessionStorage and navigate to payment
    sessionStorage.setItem('cart', JSON.stringify(cart));
    sessionStorage.setItem('cartTotal', getCartTotal().toString());
    router.push('/student/orders?checkout=true');
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className={styles.menuPage}>
        <div className="container">
          <div className={styles.menuHeader}>
            <h1>Menu</h1>
            <div className={styles.dateSelector}>
              <button
                className={`${styles.dateBtn} ${selectedDate === 'today' ? styles.dateBtnActive : ''}`}
                onClick={() => setSelectedDate('today')}
              >
                Today
              </button>
              <button
                className={`${styles.dateBtn} ${selectedDate === 'tomorrow' ? styles.dateBtnActive : ''}`}
                onClick={() => setSelectedDate('tomorrow')}
              >
                Tomorrow
              </button>
            </div>
          </div>

          <div className={styles.menuContent}>
            <div className={styles.menuItems}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  <div className="loading"></div>
                  <p>Loading menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <span style={{ fontSize: '4rem' }}>🍽️</span>
                  <h3>No menu items available</h3>
                  <p>Check back later for today's menu</p>
                </div>
              ) : (
                <div className="grid grid-cols-3">
                  {menuItems.map((item) => {
                    const inCart = getItemInCart(item.id);
                    const isSoldOut = item.available_quantity <= 0;

                    return (
                      <div key={item.id} className={`card ${styles.menuCard}`}>
                        <div className={styles.menuCardImage}>
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} />
                          ) : (
                            <div className={styles.menuCardImagePlaceholder}>
                              <span style={{ fontSize: '3rem' }}>🍽️</span>
                            </div>
                          )}
                          {isSoldOut && (
                            <div className={styles.soldOutBadge}>SOLD OUT</div>
                          )}
                        </div>
                        <div className={styles.menuCardContent}>
                          <h3 className={styles.menuCardTitle}>{item.name}</h3>
                          {item.description && (
                            <p className={styles.menuCardDescription}>
                              {item.description}
                            </p>
                          )}
                          <div className={styles.menuCardFooter}>
                            <div className={styles.menuCardPrice}>
                              ₹{item.price}
                            </div>
                          </div>
                          {!isSoldOut && (
                            <div className={styles.menuCardActions}>
                              {inCart ? (
                                <div className={styles.quantityControl}>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className={styles.quantityBtn}
                                    type="button"
                                  >
                                    −
                                  </button>
                                  <span className={styles.quantityValue}>
                                    {inCart.quantity}
                                  </span>
                                  <button
                                    onClick={() => addToCart(item)}
                                    className={styles.quantityBtn}
                                    disabled={inCart.quantity >= item.available_quantity}
                                    type="button"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="btn btn-primary btn-sm"
                                  style={{ width: '100%' }}
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            {cart.length > 0 && (
              <div className={styles.cartSidebar}>
                <div className={styles.cartCard}>
                  <h3 className={styles.cartTitle}>Your Cart</h3>
                  <div className={styles.cartItems}>
                    {cart.map((item) => (
                      <div key={item.id} className={styles.cartItem}>
                        <div className={styles.cartItemInfo}>
                          <div className={styles.cartItemName}>{item.name}</div>
                          <div className={styles.cartItemPrice}>
                            ₹{item.price} × {item.quantity}
                          </div>
                        </div>
                        <div className={styles.cartItemActions}>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className={styles.cartRemoveBtn}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.cartTotal}>
                    <span>Total:</span>
                    <span className={styles.cartTotalAmount}>
                      ₹{getCartTotal()}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
