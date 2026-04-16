import { describe, it, expect } from 'vitest'
import { buildPrompt } from './gemini'
import type { GiftFormParams } from './types'

describe('buildPrompt', () => {
  it('includes gender in prompt', () => {
    const params: GiftFormParams = {
      gender: 'male',
      ageGroup: '18-35',
      budget: '300-1000',
      occasion: 'birthday',
      relationship: 'friend',
      interests: ['sports', 'music'],
      personality: 'active',
      giftType: 'physical',
    }
    const prompt = buildPrompt(params, 'uk')
    expect(prompt).toContain('чоловік')
    expect(prompt).toContain('18-35')
    expect(prompt).toContain('300-1000')
  })

  it('includes multiple interests', () => {
    const params: GiftFormParams = {
      gender: null,
      ageGroup: null,
      budget: null,
      occasion: null,
      relationship: null,
      interests: ['cooking', 'travel'],
      personality: null,
      giftType: null,
    }
    const prompt = buildPrompt(params, 'uk')
    expect(prompt).toContain('кулінарія')
    expect(prompt).toContain('подорожі')
  })

  it('requests JSON format', () => {
    const params: GiftFormParams = {
      gender: null, ageGroup: null, budget: null, occasion: null,
      relationship: null, interests: [], personality: null, giftType: null,
    }
    const prompt = buildPrompt(params, 'uk')
    expect(prompt).toContain('JSON')
  })
})
