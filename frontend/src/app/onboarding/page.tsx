'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './onboarding.module.css'
import Button from '@/components/ui/Button'
import { API_URL } from '@/lib/api'

const questions = [
  {
    id: 'needs_mobility',
    text: 'Do you have difficulty walking or need mobility assistance products?',
  },
  {
    id: 'needs_vision',
    text: 'Do you have any vision difficulties that affect how you use digital screens?',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const currentQuestion = questions[step]
  const isLastQuestion  = step === questions.length - 1

  // Check on page load that we have pending registration data
  // If not, redirect back to register
  useEffect(() => {
    const pending = localStorage.getItem('pending_registration')
    if (!pending) {
      router.push('/register')
    }
  }, [])

  const handleAnswer = async (answer: boolean) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: answer }
    setAnswers(updatedAnswers)

    // If not the last question, just move to the next one
    if (!isLastQuestion) {
      setStep(step + 1)
      return
    }

    // Last question answered — now register the user
    setLoading(true)
    setError('')

    try {
      // Read the registration data stored from the register page
      const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}')

      // Step 1 — Register the user in the database
      const registerRes = await fetch(`${API_URL}/api/auth/register`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(pending)
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setError(registerData.error || 'Registration failed')
        setLoading(false)
        return
      }

      // Step 2 — Save their onboarding answers
      const user = registerData.user

      const onboardingRes = await fetch(`${API_URL}/api/onboarding/submit`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({
          user_id:       user.id,
          ...updatedAnswers
        })
      })

      if (!onboardingRes.ok) {
        setError('Could not save preferences')
        setLoading(false)
        return
      }

      // Step 3 — Save user to localStorage and clear pending data
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.removeItem('pending_registration')

      // Step 4 — Go to home page
      router.push('/')

    } catch (err) {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>

        {/* Progress indicator */}
        <p className={styles.progress}>
          Question {step + 1} of {questions.length}
        </p>

        {/* Question text */}
        <h1 className={styles.question}>
          {currentQuestion.text}
        </h1>

        {/* Yes / No buttons */}
        <div className={styles.actions}>
          <Button variant="primary" onClick={() => handleAnswer(true)} disabled={loading}>
            Yes
          </Button>
          <Button variant="secondary" onClick={() => handleAnswer(false)} disabled={loading}>
            No
          </Button>
        </div>

        {/* Error message */}
        {error && <p style={{ color: 'red', marginTop: '16px' }}>{error}</p>}

        {/* Shows while saving */}
        {loading && (
          <p className={styles.saving}>Creating your account...</p>
        )}

      </div>
    </main>
  )
}