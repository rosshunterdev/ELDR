'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { API_URL } from '@/lib/api'

export default function AdminPage() {
    const router = useRouter()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    async function handleToggle(id: number, currentVerified: boolean) {
        const res = await fetch(`${API_URL}/api/admin/products/${id}/verify`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verified: !currentVerified }),
        })
        if (res.ok) {
            setProducts(prev => prev.map(p =>
                p.id === id ? { ...p, verified: !currentVerified } : p
            ))
        }
    }


    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.id) {
            router.push('/login')
            return
        }
        if (user.role !== 'admin') {
            router.push('/')
            return
        }

        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                const mapped = data.products.map((item: any) => ({
                    id: item.id,
                    name: item.title,
                    price: item.price,
                    verified: item.verified,
                }))
                setProducts(mapped)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])


    if (loading) return <p style={{ padding: '2rem', fontSize: '18px' }}>Loading…</p>

    return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '2rem', color: 'var(--color-text)' }}>
            Product Verification
        </h1>

        {products.map(product => (
            <div key={product.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                marginBottom: '1rem',
                borderRadius: '12px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
            }}>
                <div>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        {product.name}
                    </p>
                    <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                        ${product.price.toFixed(2)}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {product.verified && <VerifiedBadge />}
                    <button
                        onClick={() => handleToggle(product.id, product.verified)}
                        style={{
                            minHeight: '44px',
                            padding: '0 20px',
                            borderRadius: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 600,
                            backgroundColor: product.verified ? 'var(--color-error, #dc2626)' : 'var(--color-primary)',
                            color: '#ffffff',
                        }}
                    >
                        {product.verified ? 'Revoke' : 'Approve'}
                    </button>
                </div>
            </div>
        ))}
    </div>
    )

}
