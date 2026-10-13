'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import InputField from '@/components/ui/InputField'
import AuthCard from '@/components/ui/AuthCard'
import styles from './register.module.css'
import shared from '@/components/ui/shared.module.css'
import { API_URL } from '@/lib/api'

export default function RegisterPage() {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'elder'
    })

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

        async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            // Elders go through onboarding first
            // Store their data temporarily and redirect
            if (formData.role === 'elder') {
                localStorage.setItem('pending_registration', JSON.stringify(formData))
                router.push('/onboarding')
                return
            }

            // Caregivers and sellers skip onboarding
            // Register them directly and go to home
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method:      'POST',
                credentials: 'include',
                headers:     { 'Content-Type': 'application/json' },
                body:        JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data.user))
                router.push('/')
            } else {
                setError(data.error)
            }

        } catch (err) {
            setError('Could not connect to server. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthCard
            title="Create an account"
            footer={<p>Already have an account? <Link href="/login">Log in</Link></p>}
        >
            {/* Success message */}
            {message && <p className={shared.success}>{message}</p>}

            {/* Error message */}
            {error && <p className={shared.error} role="alert">{error}</p>}

            <form onSubmit={handleSubmit} className={shared.form}>

                {/* Role selection */}
                <fieldset className={styles.roleGroup}>
                    <legend className={styles.roleLabel}>I am signing up as</legend>
                    <div className={styles.roleOptions}>
                        {['Elder', 'Caregiver', 'Seller'].map((role) => (
                            <label key={role} className={styles.roleOption}>
                                <input
                                    type="radio"
                                    name="role"
                                    value={role.toLowerCase()}
                                    checked={formData.role === role.toLowerCase()}
                                    onChange={handleChange}
                                />
                                {role}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <InputField label="First name" id="firstName" name="firstName" onChange={handleChange} />
                <InputField label="Last name" id="lastName" name="lastName" onChange={handleChange} />
                <InputField label="Phone number" type="tel" id="phone" name="phone" onChange={handleChange} />
                <InputField label="Email address" type="email" id="email" name="email" onChange={handleChange} />
                <InputField label="Password" type="password" id="password" name="password" onChange={handleChange} />
                <InputField label="Confirm password" type="password" id="confirmPassword" name="confirmPassword" onChange={handleChange} />

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                </Button>

            </form>
        </AuthCard>
    )
}
