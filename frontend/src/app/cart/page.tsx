'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import buttonStyles from '@/components/ui/Button.module.css'
import styles from './cart.module.css'
import { API_URL } from '@/lib/api'

const BagIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 016 0v2" />
  </svg>
)

// Describes the shape of each cart item from the backend
interface CartItem {
  id:         number
  product_id: number
  name:       string
  price:      number
  quantity:   number
  image?:     string  // not returned by the cart API yet
}

export default function CartPage() {

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  // Fetch cart items when the page loads
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      // Get the logged-in user from localStorage
      const stored = localStorage.getItem('user')
      if (!stored) {
        window.location.href = '/login'
        return
      }
      const user = JSON.parse(stored)

      const res = await fetch(`${API_URL}/api/cart/${user.id}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (res.ok) {
        setCartItems(data.cart || [])
      } else {
        setError(data.error || 'Could not load cart')
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (itemId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/remove/${itemId}`, {
        method:      'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        // Remove the item from state so the UI updates immediately
        setCartItems(cartItems.filter(item => item.id !== itemId))
      }
    } catch {
      setError('Could not remove item')
    }
  }

  const handleQuantityChange = async (itemId: number, change: number) => {
    // Update quantity in state immediately for responsive UI
    setCartItems(cartItems.map(item =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ))
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <main className="container" aria-busy="true">
        <h1 className={styles.title}>Your cart</h1>
        <div className={styles.itemList}>
          <div className={`skeleton ${styles.skeletonItem}`} />
          <div className={`skeleton ${styles.skeletonItem}`} />
        </div>
      </main>
    )
  }

  return (
    <main className="container">

      <h1 className={styles.title}>Your cart</h1>

      {error && <p className={styles.error} role="alert">{error}</p>}

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Products you add will appear here until you check out.</p>
          <Link href="/" className={`${buttonStyles.btn} ${buttonStyles.primary} ${buttonStyles.inline}`}>
            Browse products
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>

          <ul className={styles.itemList}>
            {cartItems.map(item => (
              <li key={item.id} className={styles.item}>

                <div className={styles.itemImage}>
                  {item.image ? <img src={item.image} alt="" /> : <BagIcon />}
                </div>

                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>${item.price.toFixed(2)} each</p>

                  <div className={styles.quantity} role="group" aria-label={`Quantity of ${item.name}`}>
                    <button
                      className={`a11y-sized ${styles.quantityBtn}`}
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles.quantityNumber} aria-live="polite">{item.quantity}</span>
                    <button
                      className={`a11y-sized ${styles.quantityBtn}`}
                      onClick={() => handleQuantityChange(item.id, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className={styles.itemEnd}>
                  <p className={styles.itemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className={`a11y-sized ${styles.remove}`}
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>

              </li>
            ))}
          </ul>

          <aside className={styles.summary} aria-labelledby="summary-title">
            <h2 id="summary-title" className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.totalRow}>
              <p className={styles.totalLabel}>Total ({itemCount} item{itemCount === 1 ? '' : 's'})</p>
              <p className={styles.totalAmount}>${total.toFixed(2)}</p>
            </div>
            <div className={styles.actions}>
              <Link href="/checkout" className={`${buttonStyles.btn} ${buttonStyles.primary}`}>
                Proceed to checkout
              </Link>
              <Link href="/" className={`${buttonStyles.btn} ${buttonStyles.secondary}`}>
                Continue shopping
              </Link>
            </div>
          </aside>

        </div>
      )}
    </main>
  )
}
