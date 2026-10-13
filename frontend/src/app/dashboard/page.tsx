'use client'

// DASHBOARD PAGE
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { API_URL } from '@/lib/api'

export default function DashboardPage() {
    const router = useRouter()

    async function handleLogout() {
        try {
            const response = await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include', // sends session cookie
            })

            if (response.ok) {
                router.push('/login')
            }
        } catch (err) {
            console.error('Logout failed', err)
        }
    }

    return (
        <main style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{
                    color: 'var(--color-primary)',
                    fontSize: '32px',
                    marginBottom: '8px',
                }}>
                    Welcome to ELDR
                </h1>
                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '18px',
                    marginBottom: '32px',
                }}>
                    You are logged in!
                </p>
                <Button variant="secondary" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </main>
    )
}