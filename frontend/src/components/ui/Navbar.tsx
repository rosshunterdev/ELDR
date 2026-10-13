'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AccessibilityToggle from './AccessibilityToggle'
import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'


const HomeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 8.5L10 2.5l7.5 6V17a1 1 0 01-1 1H13v-4.5H7V18H3.5a1 1 0 01-1-1V8.5z"/>
    </svg>
)

const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 17s-7-4.35-7-9.5A3.75 3.75 0 0110 5.6a3.75 3.75 0 017 1.9C17 12.65 10 17 10 17z"/>
    </svg>
)

const CartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1.5 1.5h2.5l2 9h9.5l2-7H5.5"/>
        <circle cx="8" cy="16.5" r="1.5"/>
        <circle cx="14.5" cy="16.5" r="1.5"/>
    </svg>
)

const AccountIcon = () => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="10" cy="7" r="3.5"/>
        <path d="M2 18.5c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
    </svg>
)

export default function Navbar() {
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSeller, setIsSeller] = useState(false)

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setIsAdmin(user.role === 'admin')
        setIsSeller(user.role === 'seller')
    }, [])


    if (pathname === '/login' || pathname === '/register') return null

    // Seller and admin links only appear for those roles
    const desktopLinks = [
        { href: '/', label: 'Home' },
        { href: '/wishlist', label: 'Wishlist' },
        { href: '/orders', label: 'Orders' },
        { href: '/cart', label: 'Cart' },
        { href: '/account', label: 'Account' },
        ...(isSeller ? [{ href: '/sell', label: 'Sell' }] : []),
        ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
    ]

    const mobileTabs = [
        { href: '/', label: 'Home', icon: <HomeIcon /> },
        { href: '/wishlist', label: 'Wishlist', icon: <HeartIcon /> },
        { href: '/cart', label: 'Cart', icon: <CartIcon /> },
        { href: '/account', label: 'Account', icon: <AccountIcon /> },
    ]

    const current = (href: string) => (pathname === href ? 'page' : undefined)

    const logo = (
        <Link href="/" className={styles.brand} aria-label="ELDR home">
            <img src="/logo.png" alt="" className={styles.logo} width={728} height={212} />
        </Link>
    )

    return (
        <header>
            {/* Desktop navbar */}
            <nav className={styles.desktopNav} aria-label="Main">
                {logo}
                <ul className={styles.links}>
                    {desktopLinks.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className={styles.link} aria-current={current(link.href)}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li className={styles.toggleSlot}>
                        <AccessibilityToggle />
                    </li>
                </ul>
            </nav>

            {/* Mobile top header */}
            <div className={styles.mobileHeader}>
                {logo}
                <AccessibilityToggle />
            </div>

            {/* Mobile bottom nav */}
            <nav className={styles.mobileNav} aria-label="Main">
                {mobileTabs.map((tab) => (
                    <Link key={tab.href} href={tab.href} className={styles.tab} aria-current={current(tab.href)}>
                        {tab.icon}
                        <span>{tab.label}</span>
                    </Link>
                ))}
            </nav>
        </header>
    )
}
