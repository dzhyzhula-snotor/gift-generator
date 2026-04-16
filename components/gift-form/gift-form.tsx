'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChipSelect } from '@/components/chip-select/chip-select'
import type { GiftFormParams, Gender, AgeGroup, Budget, Occasion, Relationship, Interest, Personality, GiftType } from '@/lib/types'
import styles from './gift-form.module.css'

const INITIAL_PARAMS: GiftFormParams = {
  gender: null, ageGroup: null, budget: null, occasion: null,
  relationship: null, interests: [], personality: null, giftType: null,
}

interface GiftFormProps {
  onSubmit: (params: GiftFormParams) => void
  isLoading: boolean
}

export function GiftForm({ onSubmit, isLoading }: GiftFormProps) {
  const t = useTranslations('form')
  const [params, setParams] = useState<GiftFormParams>(INITIAL_PARAMS)

  function set<K extends keyof GiftFormParams>(key: K, value: GiftFormParams[K]) {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(params)
  }

  const genderOptions = (['male', 'female', 'any'] as Gender[]).map(v => ({ value: v, label: t(`gender.${v}`) }))
  const ageOptions = (['0-12', '13-17', '18-35', '35-60', '60+'] as AgeGroup[]).map(v => ({ value: v, label: t(`ageGroup.${v}`) }))
  const budgetOptions = (['under-300', '300-1000', '1000-3000', '3000+'] as Budget[]).map(v => ({ value: v, label: t(`budget.${v}`) }))
  const occasionOptions = (['birthday', 'new-year', 'wedding', 'march-8', 'feb-14', 'graduation', 'just-because'] as Occasion[]).map(v => ({ value: v, label: t(`occasion.${v}`) }))
  const relationshipOptions = (['mom', 'dad', 'friend', 'partner', 'colleague', 'child', 'grandparent'] as Relationship[]).map(v => ({ value: v, label: t(`relationship.${v}`) }))
  const interestOptions = (['sports', 'cooking', 'gaming', 'music', 'reading', 'travel', 'tech', 'crafts', 'movies'] as Interest[]).map(v => ({ value: v, label: t(`interests.${v}`) }))
  const personalityOptions = (['active', 'calm', 'creative', 'practical'] as Personality[]).map(v => ({ value: v, label: t(`personality.${v}`) }))
  const giftTypeOptions = (['physical', 'experience', 'digital'] as GiftType[]).map(v => ({ value: v, label: t(`giftType.${v}`) }))

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </div>

      <div className={styles.fields}>
        {[
          { label: t('gender.label'), options: genderOptions, value: params.gender, key: 'gender' as const },
          { label: t('ageGroup.label'), options: ageOptions, value: params.ageGroup, key: 'ageGroup' as const },
          { label: t('budget.label'), options: budgetOptions, value: params.budget, key: 'budget' as const },
          { label: t('occasion.label'), options: occasionOptions, value: params.occasion, key: 'occasion' as const },
          { label: t('relationship.label'), options: relationshipOptions, value: params.relationship, key: 'relationship' as const },
          { label: t('personality.label'), options: personalityOptions, value: params.personality, key: 'personality' as const },
          { label: t('giftType.label'), options: giftTypeOptions, value: params.giftType, key: 'giftType' as const },
        ].map(({ label, options, value, key }) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{label}</label>
            <ChipSelect
              options={options}
              value={value}
              onChange={v => set(key, v as GiftFormParams[typeof key])}
            />
          </div>
        ))}

        <div className={styles.field}>
          <label className={styles.label}>{t('interests.label')}</label>
          <ChipSelect
            options={interestOptions}
            value={params.interests}
            onChange={v => set('interests', v as Interest[])}
            multi
          />
        </div>
      </div>

      <button type="submit" className={styles.submit} disabled={isLoading}>
        {isLoading ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
