'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Header } from '@/components/header/header'
import { GiftForm } from '@/components/gift-form/gift-form'
import { GiftResults } from '@/components/gift-results/gift-results'
import type { GiftFormParams, GiftIdea } from '@/lib/types'

export default function HomePage() {
  const locale = useLocale()
  const [ideas, setIdeas] = useState<GiftIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasResults, setHasResults] = useState(false)

  async function handleSubmit(params: GiftFormParams) {
    setIsLoading(true)
    setError(null)
    setHasResults(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, locale }),
      })

      if (!response.ok) throw new Error('Request failed')

      const data = await response.json()
      setIdeas(data.ideas)
    } catch {
      setError('error')
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setIdeas([])
    setError(null)
    setHasResults(false)
  }

  return (
    <>
      <Header />
      <main>
        {!hasResults && (
          <GiftForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
        {hasResults && (
          <GiftResults
            ideas={ideas}
            isLoading={isLoading}
            error={error}
            onReset={handleReset}
          />
        )}
      </main>
    </>
  )
}
