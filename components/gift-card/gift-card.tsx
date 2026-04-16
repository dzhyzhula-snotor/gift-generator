'use client'
import { useTranslations } from 'next-intl'
import type { GiftIdea } from '@/lib/types'
import styles from './gift-card.module.css'

interface GiftCardProps {
  idea: GiftIdea
}

export function GiftCard({ idea }: GiftCardProps) {
  const t = useTranslations('results')

  return (
    <div className={styles.card}>
      <span className={styles.emoji}>{idea.emoji}</span>
      <div className={styles.content}>
        <h3 className={styles.title}>{idea.title}</h3>
        <p className={styles.description}>{idea.description}</p>
      </div>
      {idea.rozetkaUrl && (
        <a
          href={idea.rozetkaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
        >
          {t('findOnRozetka')} →
        </a>
      )}
    </div>
  )
}
