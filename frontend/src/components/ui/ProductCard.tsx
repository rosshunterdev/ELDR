'use client'

import Link from 'next/link'
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { useState, useEffect } from 'react'
import styles from './ProductCard.module.css'
import { API_URL } from '@/lib/api'

type Product = {
    id: number;
    name: string;
    price: number;
    description: string;
    needsTag: string;
    verified: boolean;
    image?: string;
}

type Props = {
    product: Product;
}

// "daily living" -> "Daily living"
const needLabel = (tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1)

const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 17s-7-4.35-7-9.5A3.75 3.75 0 0110 5.6a3.75 3.75 0 017 1.9C17 12.65 10 17 10 17z"/>
    </svg>
)

export default function ProductCard({ product }: Props) {

    const [saved, setSaved] = useState(false)
    useEffect(() => {
        const stored = localStorage.getItem(`wishlist-${product.id}`)
        if (stored === 'true') setSaved(true)
    }, [])
    useEffect(() => {
        localStorage.setItem(`wishlist-${product.id}`, String(saved))
    }, [saved])

    async function handleWishlistToggle() {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        // Saving needs an account, so send signed-out shoppers to log in
        // (matches Add to Cart on the product page)
        if (!user.id) {
            window.location.href = '/login'
            return
        }

        if (!saved) {

            const res = await fetch(`${API_URL}/api/wishlist/add`, {

                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, product_id: product.id })
            })
            const data = await res.json()

        } else {
            await fetch(`${API_URL}/api/wishlist/remove`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, product_id: product.id })
            })
        }   
        setSaved(!saved)
    }

    return (
        <article className={styles.card}>
            <div className={styles.media}>
                <img
                    src={product.image ?? 'https://placehold.co/400x300'}
                    alt=""
                    loading="lazy"
                    className={styles.image}
                />
                <button
                    onClick={handleWishlistToggle}
                    aria-label={`Save ${product.name} to wishlist`}
                    aria-pressed={saved}
                    className={`a11y-sized ${styles.save}`}
                >
                    <HeartIcon />
                </button>
            </div>

            <div className={styles.body}>
                <div className={styles.tags}>
                    <span className={styles.need}>{needLabel(product.needsTag)}</span>
                    {product.verified && <VerifiedBadge />}
                </div>

                <h2 className={styles.name}>
                    <Link href={`/product/${product.id}`} className={styles.link}>
                        {product.name}
                    </Link>
                </h2>

                <p className={styles.description}>{product.description}</p>

                <div className={styles.footer}>
                    <p className={styles.price}>${product.price.toFixed(2)}</p>
                    <span className={styles.more} aria-hidden="true">View details</span>
                </div>
            </div>
        </article>
    )
}
