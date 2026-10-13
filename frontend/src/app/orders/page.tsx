'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './orders.module.css'
import { API_URL } from '@/lib/api'

// Shape of each item inside an order
interface OrderItem {
  id:       number
  name:     string
  quantity: number
  price:    number
}

// Shape of each order from the backend
interface Order {
  id:     number
  date:   string
  status: string
  total:  number
  items:  OrderItem[]
}

type Tab = 'frequent' | 'history'

export default function OrdersPage() {
  const router = useRouter()

  const [activeTab, setActiveTab]   = useState<Tab>('history')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [orders, setOrders]         = useState<Order[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) {
        router.push('/login')
        return
      }

      const res  = await fetch(`${API_URL}/api/orders/history`, {
        credentials: 'include'
      })
      const data = await res.json()

      if (res.ok) {
        setOrders(data.orders || [])
      } else {
        setError(data.error || 'Could not load orders')
      }
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  function handleToggle(id: number) {
    setExpandedId(expandedId === id ? null : id)
  }

  function getStatusClass(status: string) {
    if (status === 'delivered')  return styles.statusDelivered
    if (status === 'processing') return styles.statusProcessing
    if (status === 'cancelled')  return styles.statusCancelled
    return styles.statusDelivered
  }

  if (loading) return <p style={{ padding: '24px' }}>Loading orders...</p>

  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <h1 className={styles.pageTitle}>Orders</h1>

        {/* Tab switcher */}
        <div className={styles.tabRow}>
          <button
            className={activeTab === 'frequent' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('frequent')}
          >
            Frequently Bought
          </button>
          <button
            className={activeTab === 'history' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('history')}
          >
            Order History
          </button>
        </div>

        {/* Frequently Bought — coming soon */}
        {activeTab === 'frequent' && (
          <div className={styles.orderList}>
            <p style={{ padding: '24px', color: 'gray' }}>
              Frequently bought items coming soon.
            </p>
          </div>
        )}

        {/* Order History — real data */}
        {activeTab === 'history' && (
          <div className={styles.orderList}>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📦</span>
                <p className={styles.emptyTitle}>No orders yet</p>
                <p className={styles.emptySubtitle}>
                  Your completed purchases will appear here.
                </p>
                <a href="/" className={styles.browseButton}>
                  Browse Products
                </a>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>

                  <button
                    className={styles.orderHeader}
                    onClick={() => handleToggle(order.id)}
                  >
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>Order #{order.id}</span>
                      <span className={styles.orderDate}>{order.date}</span>
                    </div>
                    <div className={styles.orderRight}>
                      <span className={getStatusClass(order.status)}>
                        {order.status}
                      </span>
                      <span className={styles.orderTotal}>
                        ${order.total.toFixed(2)}
                      </span>
                      <span className={expandedId === order.id ? styles.arrowUp : styles.arrowDown}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Expanded items list */}
                  {expandedId === order.id && (
                    <div className={styles.itemList}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>x{item.quantity}</span>
                          <span className={styles.itemPrice}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  )
}