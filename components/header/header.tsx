'use client'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import styles from './header.module.css'

export function Header() {
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.logo}>
          {t('logo')}
        </Link>
        <nav className={styles.nav}>
          <Link href={`/${locale}/about`} className={styles.navLink}>
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
