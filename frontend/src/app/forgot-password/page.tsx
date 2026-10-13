'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import InputField from '@/components/ui/InputField'
import { API_URL } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setError('')
    setMessage('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || 'Something went wrong.')
      }
    } catch {
      setError('Could not connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
        <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>

        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: 'var(--color-text)',
          marginBottom: '0.5rem',
        }}>
          Forgot Password
        </h1>

        <p style={{
          color: 'var(--color-text-muted)',
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.5',
        }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <InputField
          label="Email Address"
          type="email"
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p style={{
            color: '#c0392b',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{
            color: 'var(--color-primary)',
            backgroundColor: '#eaf4ec',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.95rem',
          }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </div>

      </div>
    </div>
  )
}