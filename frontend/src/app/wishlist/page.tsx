'use client'

import { useState, useEffect } from 'react'
import styles from './wishlist.module.css'
import { API_URL } from '@/lib/api'

interface WishlistItem {
  id: number
  product_id: number
  name: string
  price: number
  image: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      setLoading(false)
      return
    }
    fetch(`${API_URL}/api/wishlist/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.wishlist)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load wishlist')
        setLoading(false)
      })
  }, [])




  async function handleRemove(id: number, product_id: number) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await fetch(`${API_URL}/api/wishlist/remove`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, product_id})
    })
    
    setItems(items.filter((item) => item.id !== id))
    localStorage.setItem(`wishlist-${product_id}`, 'false')
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <h1 className={styles.pageTitle}>My Wishlist</h1>

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>♡</span>
            <p className={styles.emptyTitle}>Your wishlist is empty</p>
            <p className={styles.emptySubtitle}>
              Browse our products and tap the heart icon to save items here.
            </p>
            <a href="/" className={styles.browseButton}>
              Browse Products
            </a>
          </div>
        ) : (
          <div className={styles.itemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>

                <a href={`/product/${item.product_id}`} className={styles.cardLink}>
                  <img
                    src={item.image ?? 'https://placehold.co/80x80'}
                    alt={item.name}
                    className={styles.imagePlaceholder}
                  />
                  <div className={styles.cardInfo}>
                    <p className={styles.cardName}>{item.name}</p>
                    <p className={styles.cardPrice}>${item.price.toFixed(2)}</p>
                  </div>
                </a>

                <button
                  className={styles.heartButton}
                  onClick={() => handleRemove(item.id, item.product_id)}
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  ♥
                </button>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
