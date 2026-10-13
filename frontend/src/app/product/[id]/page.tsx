'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import Button from '@/components/ui/Button'
import type { Product } from '@/data/products'
import SpeakButton from '@/components/ui/SpeakButton'
import styles from './product.module.css'
import { API_URL } from '@/lib/api'

// "daily living" -> "Daily living"
const needLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1)

export default function ProductPage() {
    const params = useParams()
    const id = params.id as string

    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [added, setAdded] = useState(false)
    const [loadFailed, setLoadFailed] = useState(false)
    const [imageFailed, setImageFailed] = useState(false)

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then((res) => res.json())
            .then((data) => {
                const mapped = data.products.map((item: any) => ({
                    id: item.id,
                    name: item.title,
                    price: item.price,
                    description: item.description,
                    needsTag: item.category.replace('_', ' '),
                    verified: item.verified,
                    image: item.image,
                }))
                const found = mapped.find((p: Product) => p.id === Number(id))
                setProduct(found ?? null)
                setLoading(false)
            })
            .catch(() => {
                setLoadFailed(true)
                setLoading(false)
            })
    }, [id])

    async function handleAddToCart() {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const userId = user.id
        if (!userId) {
            window.location.href = '/login'
            return
        }
        await fetch(`${API_URL}/api/cart/add`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, product_id: product!.id, quantity: 1 }),
        })
        // Stays visible so there is time to read it and follow the cart link
        setAdded(true)
    }

    const backLink = (
        <Link href="/" className={styles.back}>
            <span aria-hidden="true">←</span> Back to products
        </Link>
    )

    if (loading) {
        return (
            <main className={`container ${styles.page}`} aria-busy="true">
                {backLink}
                <div className={styles.layout}>
                    <div className={`skeleton ${styles.skeletonMedia}`} />
                    <div className={styles.info}>
                        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '30%' }} />
                        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '80%', height: '2.5rem' }} />
                        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '25%', height: '2rem' }} />
                        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '95%' }} />
                        <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '70%' }} />
                    </div>
                </div>
            </main>
        )
    }

    if (loadFailed) {
        return (
            <main className={`container ${styles.page}`}>
                {backLink}
                <div className="empty-state" role="alert">
                    <h1>This product didn&apos;t load</h1>
                    <p>Check your connection, then reload the page.</p>
                    <Button variant="secondary" fullWidth={false} onClick={() => window.location.reload()}>
                        Reload page
                    </Button>
                </div>
            </main>
        )
    }

    if (!product) {
        return (
            <main className={`container ${styles.page}`}>
                {backLink}
                <div className="empty-state">
                    <h1>Product not found</h1>
                    <p>This product may have been removed, or the link is wrong.</p>
                    <Link href="/">Browse all products</Link>
                </div>
            </main>
        )
    }

    return (
        <main className={`container ${styles.page}`}>
            {backLink}

            <div className={styles.layout}>
                <div className={styles.media}>
                    {product.image && !imageFailed && (
                        <img
                            src={product.image}
                            alt={product.name}
                            className={styles.image}
                            onError={() => setImageFailed(true)}
                        />
                    )}
                </div>

                <div className={styles.info}>
                    <div className={styles.tags}>
                        <span className={styles.need}>{needLabel(product.needsTag)}</span>
                        {product.verified && <VerifiedBadge />}
                    </div>

                    <div className={styles.speakRow}>
                        <h1 className={styles.title}>{product.name}</h1>
                        <SpeakButton text={product.name} label="product name" />
                    </div>

                    <p className={styles.price}>${product.price.toFixed(2)}</p>

                    <div className={styles.speakRow}>
                        <p className={styles.description}>{product.description}</p>
                        <SpeakButton text={product.description} label="product description" />
                    </div>

                    <div className={styles.purchase}>
                        <Button variant="primary" onClick={handleAddToCart}>
                            {added ? 'Add another' : 'Add to cart'}
                        </Button>
                        <p className={styles.status} aria-live="polite">
                            {added && (
                                <>
                                    Added to your cart. <Link href="/cart">View cart</Link>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
