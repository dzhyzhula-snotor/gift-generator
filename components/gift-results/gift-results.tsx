'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { GiftCard } from '@/components/gift-card/gift-card'
import { SkeletonCard } from '@/components/skeleton-card/skeleton-card'
import type { GiftIdea } from '@/lib/types'
import styles from './gift-results.module.css'

interface GiftResultsProps {
  ideas: GiftIdea[]
  isLoading: boolean
  error: string | null
  onReset: () => void
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function GiftResults({ ideas, isLoading, error, onReset }: GiftResultsProps) {
  const t = useTranslations('results')

  if (error) {
    return (
      <div className={styles.error}>
        <p>{t('error')}</p>
        <button onClick={onReset} className={styles.reset}>{t('tryAgain')}</button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.title}>{t('title')}</h2>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!ideas.length) return null

  return (
    <div className={styles.section}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{t('title')}</h2>
        <button onClick={onReset} className={styles.reset}>{t('tryAgain')}</button>
      </div>
      <motion.div
        className={styles.grid}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {ideas.map((idea, index) => (
          <motion.div key={index} variants={item}>
            <GiftCard idea={idea} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
