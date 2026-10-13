'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import styles from './checkout.module.css'
import shared from '@/components/ui/shared.module.css'
import { API_URL } from '@/lib/api'

interface CartItem {
  id:         number
  product_id: number
  name:       string
  price:      number
  quantity:   number
}

export default function CheckoutPage() {

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [ordering, setOrdering]   = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) {
        window.location.href = '/login'
        return
      }
      const user = JSON.parse(stored)

      const res  = await fetch(`${API_URL}/api/cart/${user.id}`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (res.ok) {
        setCartItems(data.cart || [])
      } else {
        setError('Could not load cart')
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  async function handlePlaceOrder() {
    setOrdering(true)
    setError('')

    try {
      const stored = localStorage.getItem('user')
      if (!stored) {
        window.location.href = '/login'
        return
      }
      const user = JSON.parse(stored)

      const shoppingFor = localStorage.getItem('shopping_for')
      const recipientId = shoppingFor
        ? JSON.parse(shoppingFor).elder_id
        : null

      const res  = await fetch(`${API_URL}/api/cart/checkout`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          user_id:      user.id,
          recipient_id: recipientId
        })
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.removeItem('shopping_for')

        localStorage.setItem('lastOrder', JSON.stringify({
          order_id:   data.order_id,
          total:      data.total,
          status:     'Pending',
          created_at: new Date().toISOString(),
        }))

        window.location.href = '/order-confirmation'
      } else {
        setError(data.error || 'Something went wrong')
      }

    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) return <p style={{ padding: '24px' }}>Loading checkout...</p>

  return (
    <main className={styles.page}>

      <h1 className={styles.title}>Checkout</h1>

      <Link href="/cart">← Back to cart</Link>

      <div className={styles.content}>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Summary</h2>

          {cartItems.map(item => (
            <div key={item.id} className={styles.summaryRow}>
              <p className={styles.summaryName}>
                {item.name} × {item.quantity}
              </p>
              <p className={styles.summaryPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className={styles.summaryDivider}>
            <p className={styles.totalLabel}>Total</p>
            <p className={styles.totalAmount}>${total.toFixed(2)}</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Shipping Address</h2>
          <p className={styles.address}>
            123 Example Street, Auckland, New Zealand
          </p>
        </div>

        {error && <p className={shared.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="primary" onClick={handlePlaceOrder} disabled={ordering}>
            {ordering ? 'Placing order...' : 'Place Order'}
          </Button>
        </div>

      </div>
    </main>
  )
}