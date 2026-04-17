import { useTranslations } from 'next-intl'
import { Header } from '@/components/header/header'
import styles from './about.module.css'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.description}>{t('description')}</p>
      </main>
    </>
  )
}
