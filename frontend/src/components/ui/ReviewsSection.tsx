// ReviewsSection.tsx
// Displays elderly-specific reviews for a single product.

'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { API_URL } from '@/lib/api'
import styles from './ReviewsSection.module.css'

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
// Describes the shape of one review coming back from the API
interface Review {
    id: number
    rating: number
    comment: string | null
    reviewer: string
    created_at: string | null
}

// Describes the props this component accepts
interface Props {
    productId: string
    // string because useParams() returns strings — matches how Ross reads id
}

// ─── STAR DISPLAY ─────────────────────────────────────────────────────────────
// One star outline, filled in when `filled` is true
function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 2.5l2.3 4.7 5.2.75-3.75 3.65.9 5.15L10 14.3l-4.65 2.45.9-5.15L2.5 7.95l5.2-.75L10 2.5z" />
        </svg>
    )
}

// Shows a 1-5 rating as five stars; screen readers hear "Rated 4 out of 5"
function Stars({ rating }: { rating: number }) {
    return (
        <span className={styles.stars} role="img" aria-label={`Rated ${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((n) => <StarIcon key={n} filled={n <= rating} />)}
        </span>
    )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReviewsSection({ productId }: Props) {

    const [reviews, setReviews]       = useState<Review[]>([])
    const [loading, setLoading]       = useState(true)
    const [error, setError]           = useState<string | null>(null)
    const [rating, setRating]         = useState<number>(0)
    const [comment, setComment]       = useState<string>('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [refreshCount, setRefreshCount] = useState(0)

    // Read the user from localStorage — same pattern as the rest of the frontend
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const currentUser = stored ? JSON.parse(stored) : null

    useEffect(() => {
        // Re-runs if productId changes — so navigating between product pages
        // triggers a fresh fetch rather than showing the previous product's reviews
        async function fetchReviews() {
            try {
                const res = await fetch(
                    `${API_URL}/api/reviews/${productId}`,
                    { credentials: 'include' }
                )
                // Template literal — backtick string that embeds ${productId}
                // at runtime. Equivalent to 'http://.../' + productId

                if (!res.ok) {
                    setError('Could not load reviews.')
                    return
                }

                const data = await res.json()
                setReviews(data.reviews)
                // data.reviews matches the key your Flask endpoint returns:
                // return jsonify({'reviews': result, 'count': len(result)})

            } catch {
                setError('Could not load reviews.')
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()
    }, [productId, refreshCount])

        async function handleSubmitReview() {
        if (rating === 0) {
            setSubmitError('Please select a star rating.')
            return
        }
        setSubmitting(true)
        setSubmitError(null)

        try {
            const res = await fetch(`${API_URL}/api/reviews/${productId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment })
            })
            const data = await res.json()

            if (res.status === 409) {
                // 409 means duplicate — user already reviewed this product
                setSubmitError('You have already reviewed this product.')
                return
            }
            if (!res.ok) {
                setSubmitError(data.error || 'Could not submit review.')
                return
            }

            // Success — reset form and refresh the reviews list
            setSubmitSuccess(true)
            setRating(0)
            setComment('')
            // Trigger a re-fetch by calling fetchReviews again
            // We do this by toggling a refresh counter
            setRefreshCount(c => c + 1)

        } catch {
            setSubmitError('Could not connect to server.')
        } finally {
            setSubmitting(false)
        }
    }

    // ─── RENDER ───────────────────────────────────────────────────────────────
    return (
        <section className={styles.section} aria-labelledby="reviews-heading">

            <h2 id="reviews-heading" className={styles.heading}>
                Reviews from older shoppers {!loading && `(${reviews.length})`}
            </h2>
            {/* !loading && `(${reviews.length})` — only show the count once
                loading is done. && short-circuits: if left is false, right is skipped */}

            <div className={styles.layout}>
                <div>
                    {loading && <p className={styles.muted}>Loading reviews…</p>}

                    {error && <p className={styles.error} role="alert">{error}</p>}

                    {/* All three must be true, so "no reviews" never flashes while loading */}
                    {!loading && !error && reviews.length === 0 && (
                        <p className={styles.muted}>No reviews yet. Be the first to share how it worked for you.</p>
                    )}

                    {reviews.length > 0 && (
                        <ul className={styles.list}>
                            {/* key must be a unique ID from the data, never the array index */}
                            {reviews.map((review) => (
                                <li key={review.id} className={styles.review}>
                                    <div className={styles.reviewHeader}>
                                        <span className={styles.reviewer}>{review.reviewer}</span>
                                        <Stars rating={review.rating} />
                                    </div>
                                    {/* Formats the ISO date as "1 June 2026" using NZ locale */}
                                    {review.created_at && (
                                        <p className={styles.date}>
                                            {new Date(review.created_at).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    )}
                                    {/* A review with no comment just shows stars */}
                                    {review.comment && <p className={styles.comment}>{review.comment}</p>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Review form */}
                <div className={styles.form}>
                    <h3 className={styles.formTitle}>Leave a review</h3>

                    {!currentUser ? (
                        <p className={styles.muted}>
                            <Link href="/login">Log in</Link> to leave a review.
                        </p>
                    ) : submitSuccess ? (
                        <p className={styles.success} role="status">Review posted. Thank you.</p>
                    ) : (
                        <>
                            <div role="radiogroup" aria-labelledby="rating-label">
                                <p id="rating-label" className={styles.fieldLabel}>Your rating</p>
                                <div className={styles.ratingInput}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === star}
                                            aria-label={`${star} star${star === 1 ? '' : 's'}`}
                                            onClick={() => setRating(star)}
                                            className={`a11y-sized ${styles.starButton} ${star <= rating ? styles.starOn : ''}`}
                                        >
                                            <StarIcon filled={star <= rating} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label htmlFor="review-comment" className={styles.fieldLabel}>
                                Your review (optional)
                            </label>
                            <textarea
                                id="review-comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="How did this product work for you?"
                                rows={4}
                                className={styles.textarea}
                            />

                            {submitError && <p className={styles.error} role="alert">{submitError}</p>}

                            <Button variant="primary" onClick={handleSubmitReview} disabled={submitting}>
                                {submitting ? 'Posting review...' : 'Post review'}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}
