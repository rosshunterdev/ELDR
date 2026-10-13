import Link from 'next/link'
import styles from './AuthCard.module.css'

type Props = {
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
}

// Login and register hide the navbar, so the card carries the logo
// as the way back home
export default function AuthCard({ title, children, footer }: Props) {
    return (
        <main className={styles.wrapper}>
            <div className={styles.inner}>
                <Link href="/" className={styles.brand} aria-label="ELDR home">
                    <img src="/logo.png" alt="" width={728} height={212} className={styles.logo} />
                </Link>
                <div className={styles.card}>
                    <h1 className={styles.title}>{title}</h1>
                    {children}
                </div>
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </main>
    )
}
