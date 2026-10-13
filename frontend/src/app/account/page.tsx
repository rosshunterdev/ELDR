'use client'

import { useState, useEffect } from 'react'
import styles from './AccountPage.module.css'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api'

interface CurrentUser {
  id:         number
  first_name: string
  last_name:  string
  email:      string
  role:       string
}

interface LinkedHelper {
  name:         string
  relationship: string
}

const menuItems = [
  { label: 'Wishlist',      href: '/wishlist' },
  { label: 'Orders',        href: '/orders' },
  { label: 'Manage Access', href: '/caregiver' },
  { label: 'Settings',      href: '/account/settings' },
]

export default function AccountPage() {
  const router = useRouter()

  const [user, setUser]         = useState<CurrentUser | null>(null)
  const [helper, setHelper]     = useState<LinkedHelper | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Read logged-in user from localStorage
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/login')
      return
    }
    const parsed = JSON.parse(stored)
    setUser(parsed)

    // Fetch their linked caregivers/elders to show on the card
    fetchLinks(parsed.id)
  }, [])

  const fetchLinks = async (userId: number) => {
    try {
      const res  = await fetch(`${API_URL}/api/caregiver/links`, {
        credentials: 'include'
      })
      const data = await res.json()

      // Show the first linked helper on the account card
      if (res.ok && data.links && data.links.length > 0) {
        const first = data.links[0]
        setHelper({
          name:         first.name,
          relationship: first.relationship
        })
      }
    } catch {
      // If links can't be fetched, just don't show the helper card
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method:      'POST',
        credentials: 'include'
      })
    } catch {
      // Continue with logout even if backend call fails
    }
    localStorage.removeItem('user')
    localStorage.removeItem('shopping_for')
    router.push('/login')
  }

  if (loading) return <p style={{ padding: '24px' }}>Loading...</p>

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Account Settings</h1>

        {/* Avatar placeholder */}
        <div className={styles.avatar} />

        {/* Name and role from real user data */}
        <div className={styles.identity}>
          <p className={styles.userName}>
            {user?.first_name} {user?.last_name}
          </p>
          <span className={styles.roleBadge}>{user?.role}</span>
        </div>

        {/* Helper card — only shows if a linked helper exists */}
        {helper && (
          <div className={styles.helperCard}>
            <p className={styles.helperText}>
              Linked Helper:<br />
              <strong>{helper.name}</strong><br />
              {helper.relationship}
            </p>
          </div>
        )}

        <div className={styles.menuList}>
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <Button variant="secondary">{item.label}</Button>
            </Link>
          ))}
        </div>

        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </main>
    </div>
  )
}