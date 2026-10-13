import { useAccessibility } from "../../context/AccessibilityContext";
import styles from './AccessibilityToggle.module.css'

export default function AccessibilityToggle() {
    const { isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();

    return (
        <button
            aria-pressed={isAccessibilityMode}
            aria-label="Accessibility Mode"
            onClick={toggleAccessibilityMode}
            className={`toggle-btn ${styles.toggle}`}
        >
            <span className={styles.label}>Accessibility</span>
            <span className={styles.track} aria-hidden="true">
                <span className={styles.thumb} />
            </span>
        </button>
    )
}
