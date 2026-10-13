'use client';

import ProductCard from '@/components/ui/ProductCard';
import Button from '@/components/ui/Button';
import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/data/products';
import { filterProducts } from '@/lib/filterProducts';
import styles from './home.module.css';

const svgProps = {
  width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
} as const

// Walking stick
const MobilityIcon = () => (
  <svg {...svgProps}>
    <path d="M14 3.5c2.2 0 3.5 1.4 3.5 3.2" />
    <path d="M14 3.5V21" />
    <path d="M11 21h6" />
  </svg>
)

const VisionIcon = () => (
  <svg {...svgProps}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const HearingIcon = () => (
  <svg {...svgProps}>
    <path d="M6.5 9a5.5 5.5 0 1111 0c0 3.5-3.5 4.5-3.5 7.5a3 3 0 01-5.6 1.5" />
    <path d="M9.5 9a2.5 2.5 0 015 0" />
  </svg>
)

// Mug
const DailyLivingIcon = () => (
  <svg {...svgProps}>
    <path d="M4 8h12v7a5 5 0 01-5 5H9a5 5 0 01-5-5V8z" />
    <path d="M16 10h1.5a2.5 2.5 0 010 5H16" />
    <path d="M8 3.5v1.5M12 3.5v1.5" />
  </svg>
)

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </svg>
)

// Values match the product category after '_' -> ' ' (see the fetch mapping)
const needs = [
  { label: 'Mobility',     value: 'mobility',     icon: <MobilityIcon /> },
  { label: 'Vision',       value: 'vision',       icon: <VisionIcon /> },
  { label: 'Hearing',      value: 'hearing',      icon: <HearingIcon /> },
  { label: 'Daily living', value: 'daily living', icon: <DailyLivingIcon /> },
]

const plural = (n: number) => `${n} product${n === 1 ? '' : 's'}`

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNeed, setSelectedNeed] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [searchText, setSearchText] = useState('')

  // Only sets state once the request settles, so it is safe to call from an effect
  const loadProducts = useCallback(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.products.map((item: any) => ({
          id: item.id,
          name: item.title,
          price: item.price,
          image: item.image,
          description: item.description,
          needsTag: item.category.replace('_', ' '),
          verified: item.verified,
        }))
        setProducts(mapped)
        setLoading(false)
      })
      .catch(() => {
        setError('Products could not be loaded. Check your connection and try again.')
        setLoading(false)
      })
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  function retry() {
    setLoading(true)
    setError(null)
    loadProducts()
  }

  // Need first, then narrow to verified - reuses the tested filter for both
  const byNeed = filterProducts(products, searchText, selectedNeed)
  const filteredProducts = verifiedOnly ? filterProducts(byNeed, '', 'verified') : byNeed

  const countFor = (need: string) => products.filter((p) => p.needsTag === need).length
  const activeNeed = needs.find((n) => n.value === selectedNeed)
  const isFiltered = selectedNeed !== 'all' || verifiedOnly || searchText !== ''

  function clearFilters() {
    setSelectedNeed('all')
    setVerifiedOnly(false)
    setSearchText('')
  }

  return (
    <main className="container">

      <div className={styles.intro}>
        <h1 className={styles.title}>Shop by what you need</h1>
        <p className={styles.lede}>
          Products for older New Zealanders and the people who help them. Look for
          the ELDR Verified badge on products that meet elderly-friendly standards.
        </p>
      </div>

      <div className={styles.search} role="search">
        <label htmlFor="product-search" className="visually-hidden">Search products</label>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          id="product-search"
          className={styles.searchInput}
          onChange={(e) => setSearchText(e.target.value)}
          type="search"
          value={searchText}
          placeholder="Search products"
        />
      </div>

      {/* Need tiles: pressing one filters the list, pressing it again clears it */}
      <ul className={styles.needs} aria-label="Filter by need">
        {needs.map((need) => (
          <li key={need.value}>
            <button
              className={`a11y-sized ${styles.tile}`}
              aria-pressed={selectedNeed === need.value}
              onClick={() => setSelectedNeed(selectedNeed === need.value ? 'all' : need.value)}
            >
              <span className={styles.tileIcon}>{need.icon}</span>
              <span className={styles.tileLabel}>{need.label}</span>
              <span className={styles.tileCount}>{loading ? '' : plural(countFor(need.value))}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.toolbar}>
        <p className={styles.resultCount} aria-live="polite">
          {loading
            ? 'Loading products'
            : activeNeed
              ? `${plural(filteredProducts.length)} for ${activeNeed.label.toLowerCase()}`
              : plural(filteredProducts.length)}
          {isFiltered && !loading && (
            <button className={`a11y-sized ${styles.clear}`} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </p>
        <label className={styles.verifiedToggle}>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          ELDR Verified only
        </label>
      </div>

      {error ? (
        <div className="empty-state" role="alert">
          <h2>Products didn&apos;t load</h2>
          <p>{error}</p>
          <Button variant="secondary" fullWidth={false} onClick={retry}>Try again</Button>
        </div>
      ) : loading ? (
        <ul className={styles.grid} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className={styles.skeletonCard}>
              <div className={`skeleton ${styles.skeletonImage}`} />
              <div className={styles.skeletonLines}>
                <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
                <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '75%' }} />
                <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '55%' }} />
              </div>
            </li>
          ))}
        </ul>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h2>No products match</h2>
          <p>Try a different search word, or clear the filters to see everything.</p>
          <Button variant="secondary" fullWidth={false} onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filteredProducts.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
