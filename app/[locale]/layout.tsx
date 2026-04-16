import type { Metadata } from 'next'
import { Poiret_One } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import '@/styles/globals.css'

const poiretOne = Poiret_One({
  weight: '400',
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isUk = locale === 'uk'
  return {
    title: isUk
      ? 'Дарунок — ідеальний подарунок за 30 секунд'
      : 'Darunok — perfect gift in 30 seconds',
    description: isUk
      ? 'Генератор ідей для подарунків з AI. Введи параметри — отримай персоналізовані ідеї з посиланнями на Rozetka.'
      : 'AI gift idea generator. Enter recipient details — get personalized ideas with Rozetka links.',
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages({ locale })
  return (
    <html lang={locale} className={poiretOne.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
