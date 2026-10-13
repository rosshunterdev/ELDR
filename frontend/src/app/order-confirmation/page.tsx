'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import styles from './order-confirmation.module.css'

export default function OrderConfirmationPage() {

    const [order, setOrder] = useState<any>(null)

    useEffect(() => {
        const stored = localStorage.getItem('lastOrder')
        if (stored) {
            setOrder(JSON.parse(stored))
        }
    }, [])

    if (!order) return <p>Loading...</p>

    return (
        <main className={styles.page}>

            <div className={styles.header}>
                <div className={styles.checkmark}>✓</div>
                <h1 className={styles.title}>Order Confirmed!</h1>
                <p className={styles.subtitle}>
                    Thank you for your order. Order #{order.order_id}
                </p>
            </div>

            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Order Details</h2>

                <div className={styles.row}>
                    <p className={styles.rowLabel}>Order ID</p>
                    <p className={styles.rowValue}>#{order.order_id}</p>
                </div>

                <div className={styles.row}>
                    <p className={styles.rowLabel}>Status</p>
                    <span className={styles.statusBadge}>{order.status}</span>
                </div>

                <div className={styles.row}>
                    <p className={styles.rowLabel}>Date</p>
                    <p className={styles.rowValue}>
                        {new Date(order.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className={styles.card}>
                <h2 className={styles.cardTitle}>Total</h2>
                <div className={styles.divider}>
                    <p className={styles.totalLabel}>Total</p>
                    <p className={styles.totalAmount}>${order.total.toFixed(2)}</p>
                </div>
            </div>

            <div className={styles.actions}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Button variant="primary">Continue Shopping</Button>
                </Link>
            </div>

        </main>
    )
}