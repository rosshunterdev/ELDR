'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import { API_URL } from '@/lib/api'

// The four valid values from the product_needs enum — must match the DB exactly
const CATEGORIES = [
  { value: 'mobility',     label: 'Mobility' },
  { value: 'vision',       label: 'Vision' },
  { value: 'hearing',      label: 'Hearing' },
  { value: 'daily_living', label: 'Daily living' },
]

// Shared styles so the plain inputs/textarea match InputField exactly
const labelStyle = {
  color: 'var(--color-text-muted)',
  display: 'block',
  marginBottom: '4px',
}
const fieldStyle = {
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: '12px',
  padding: '12px',
  fontSize: '18px',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text)',
  display: 'block',
}

export default function SellPage() {
  const router = useRouter()

  // ─── EP-124: seller-only gate ───────────────────────────────
  // authorized stays false until we confirm a seller, so the form
  // never flashes on screen for a non-seller before the redirect
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) { router.push('/login'); return }
    if (user.role !== 'seller') { router.push('/'); return }
    setAuthorized(true)
  }, [])

  // ─── EP-123: form state ─────────────────────────────────────
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // EP-127 will replace this stub with the real POST
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side check before we hit the network — fail fast with a clear message
    if (!name.trim() || !price || !category) {
      setError('Please add a product name, price, and category.')
      return
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}')

    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: user.id,
          title: name,
          price: parseFloat(price),
          stock: stock ? parseInt(stock, 10) : 0,
          description,
          image,
          category,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      // Success — show the seller their new listing
      const data = await res.json()
      router.push(`/product/${data.id}`)
    } catch {
      setError('Could not reach the server. Please try again.')
      setSubmitting(false)
    }
  }


  if (!authorized) return null

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
        Add a product
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        List a new item for the marketplace.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Reuse InputField for the simple text fields */}
        <InputField label="Product name" id="name" name="name"
          onChange={(e) => setName(e.target.value)} />

        {/* Price + Stock side by side */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="price" style={labelStyle}>Price (NZD)</label>
            <input id="price" name="price" type="number" min="0" step="0.01"
              value={price} onChange={(e) => setPrice(e.target.value)} style={fieldStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="stock" style={labelStyle}>Stock</label>
            <input id="stock" name="stock" type="number" min="0" step="1"
              value={stock} onChange={(e) => setStock(e.target.value)} style={fieldStyle} />
          </div>
        </div>

        {/* Description needs a textarea — InputField is single-line */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="description" style={labelStyle}>Description</label>
          <textarea id="description" name="description" rows={4}
            value={description} onChange={(e) => setDescription(e.target.value)}
            style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>

        <InputField label="Image URL" id="image" name="image"
          onChange={(e) => setImage(e.target.value)} />

        {/* Category — segmented control, no dropdown (accessibility rule) */}
        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
          <legend style={{ ...labelStyle, padding: 0 }}>Category</legend>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => {
              const selected = category === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(c.value)}
                  style={{
                    flex: '1 1 120px',
                    minHeight: '44px',
                    borderRadius: '12px',
                    border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: selected ? '#ffffff' : 'var(--color-text)',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              )
            })}
          </div>
        </fieldset>

                {error && (
          <p role="alert" style={{ color: 'var(--color-error, #dc2626)', fontSize: '16px', marginBottom: '12px' }}>
            {error}
          </p>
        )}

        <Button variant="primary" type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add product'}
        </Button>

      </form>
    </div>
  )
}
