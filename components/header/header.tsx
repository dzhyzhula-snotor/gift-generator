'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import styles from './header.module.css'

export function Header() {
  const t = useTranslations('header')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          {t('logo')}
        </Link>
        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>
            {t('about')}
          </Link>
          <div className={styles.langSwitch}>
            {(['uk', 'en'] as const).map(lang => (
              <button
                key={lang}
                className={styles.langBtn}
                data-active={locale === lang}
                onClick={() => switchLocale(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
