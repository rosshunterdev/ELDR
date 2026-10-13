import styles from './VerifiedBadge.module.css'

export default function VerifiedBadge() {
    return (
        <span className={styles.badge}>
            <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3.5 8.5l3 3 6-7" />
            </svg>
            ELDR Verified
        </span>
    )
}
