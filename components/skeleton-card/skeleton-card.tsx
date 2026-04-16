import styles from './skeleton-card.module.css'

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={`${styles.shimmer} ${styles.emoji}`} />
      <div className={styles.content}>
        <div className={`${styles.shimmer} ${styles.title}`} />
        <div className={`${styles.shimmer} ${styles.line}`} />
        <div className={`${styles.shimmer} ${styles.lineShort}`} />
      </div>
      <div className={`${styles.shimmer} ${styles.button}`} />
    </div>
  )
}
