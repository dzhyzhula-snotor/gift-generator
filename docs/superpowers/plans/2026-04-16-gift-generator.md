# Gift Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Побудувати Next.js сайт-генератор ідей для подарунків з AI (Gemini API), мультимовою (UA/EN) та адаптивним дизайном для українського ринку.

**Architecture:** Одна сторінка з формою (chip-select параметри) → Next.js API route → Gemini API генерує 6 ідей у JSON → відображення карток з посиланнями на Rozetka. Стилі через CSS Modules + глобальні CSS Variables.

**Tech Stack:** Next.js 14 (App Router), TypeScript, CSS Modules, Framer Motion, next-intl, Gemini API (@google/generative-ai), Vitest, React Testing Library, Vercel.

---

## File Map

```
gift-generator/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              # root layout з шрифтом і провайдерами
│   │   ├── page.tsx                # головна сторінка
│   │   └── about/
│   │       └── page.tsx            # сторінка "Про сервіс"
│   └── api/
│       └── generate/
│           └── route.ts            # POST /api/generate → Gemini
├── components/
│   ├── header/
│   │   ├── header.tsx              # хедер + перемикач мови
│   │   └── header.module.css
│   ├── chip-select/
│   │   ├── chip-select.tsx         # reusable chip selector
│   │   └── chip-select.module.css
│   ├── gift-form/
│   │   ├── gift-form.tsx           # форма з усіма параметрами
│   │   └── gift-form.module.css
│   ├── gift-card/
│   │   ├── gift-card.tsx           # одна картка результату
│   │   └── gift-card.module.css
│   ├── gift-results/
│   │   ├── gift-results.tsx        # grid карток + stagger анімація
│   │   └── gift-results.module.css
│   └── skeleton-card/
│       ├── skeleton-card.tsx       # loading placeholder
│       └── skeleton-card.module.css
├── lib/
│   ├── types.ts                    # TypeScript типи
│   └── gemini.ts                   # Gemini клієнт + prompt builder
├── styles/
│   └── globals.css                 # CSS variables + reset
├── messages/
│   ├── uk.json                     # переклади UA
│   └── en.json                     # переклади EN
├── i18n.ts                         # next-intl конфіг
├── middleware.ts                   # next-intl routing middleware
├── next.config.ts
├── .env.local                      # GEMINI_API_KEY (не комітити)
├── .env.example                    # шаблон env
└── vitest.config.ts                # конфіг тестів
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore`

- [ ] **Step 1: Ініціалізувати Next.js проект**

```bash
cd /Users/admin/Sites/gift-generator
npx create-next-app@latest . --typescript --app --no-tailwind --no-src-dir --import-alias "@/*" --eslint
```

- [ ] **Step 2: Встановити залежності**

```bash
npm install framer-motion next-intl @google/generative-ai
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 3: Налаштувати vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: Створити vitest.setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Створити .env.example**

```
GEMINI_API_KEY=your_gemini_api_key_here
```

- [ ] **Step 6: Переконатись що .env.local є в .gitignore**

Відкрити `.gitignore` і перевірити що рядок `.env.local` є (create-next-app додає автоматично).

- [ ] **Step 7: Створити .env.local з реальним ключем**

Отримати безкоштовний ключ на https://aistudio.google.com/apikey і додати:
```
GEMINI_API_KEY=<твій_ключ>
```

- [ ] **Step 8: Commit**

```bash
git add . && git commit -m "feat: initial Next.js project setup"
git push
```

---

## Task 2: Глобальні стилі та типи

**Files:**
- Create: `styles/globals.css`, `lib/types.ts`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Написати CSS variables у styles/globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Poiret+One&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg: #0a0a0a;
  --color-surface: #111111;
  --color-surface-hover: #1a1a1a;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.2);
  --color-text: #ffffff;
  --color-text-muted: #888888;
  --color-accent-start: #a855f7;
  --color-accent-end: #ec4899;
  --font-display: 'Poiret One', cursive;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 999px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border);
  --transition: 0.2s ease;
}

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; background: none; font-family: inherit; }
```

- [ ] **Step 2: Визначити TypeScript типи у lib/types.ts**

```ts
export type Gender = 'male' | 'female' | 'any'
export type AgeGroup = '0-12' | '13-17' | '18-35' | '35-60' | '60+'
export type Budget = 'under-300' | '300-1000' | '1000-3000' | '3000+'
export type Occasion = 'birthday' | 'new-year' | 'wedding' | 'march-8' | 'feb-14' | 'graduation' | 'just-because'
export type Relationship = 'mom' | 'dad' | 'friend' | 'partner' | 'colleague' | 'child' | 'grandparent'
export type Interest = 'sports' | 'cooking' | 'gaming' | 'music' | 'reading' | 'travel' | 'tech' | 'crafts' | 'movies'
export type Personality = 'active' | 'calm' | 'creative' | 'practical'
export type GiftType = 'physical' | 'experience' | 'digital'

export interface GiftFormParams {
  gender: Gender | null
  ageGroup: AgeGroup | null
  budget: Budget | null
  occasion: Occasion | null
  relationship: Relationship | null
  interests: Interest[]
  personality: Personality | null
  giftType: GiftType | null
}

export interface GiftIdea {
  title: string
  description: string
  emoji: string
  searchQuery: string
  rozetkaUrl: string
}

export interface GenerateResponse {
  ideas: GiftIdea[]
}

export interface GenerateRequest {
  params: GiftFormParams
  locale: string
}
```

- [ ] **Step 3: Налаштувати layout з Poiret One через next/font**

У `app/[locale]/layout.tsx` підключити шрифт:

```tsx
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

export const metadata: Metadata = {
  title: 'Дарунок — ідеальний подарунок за 30 секунд',
  description: 'Генератор ідей для подарунків з AI. Введи параметри — отримай персоналізовані ідеї з посиланнями на Rozetka.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()
  return (
    <html lang={params.locale} className={poiretOne.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add global styles, CSS variables, and TypeScript types"
git push
```

---

## Task 3: next-intl конфігурація

**Files:**
- Create: `i18n.ts`, `middleware.ts`, `messages/uk.json`, `messages/en.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Створити i18n.ts**

```ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))
```

- [ ] **Step 2: Створити middleware.ts**

```ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['uk', 'en'],
  defaultLocale: 'uk',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 3: Оновити next.config.ts**

```ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withNextIntl(nextConfig)
```

- [ ] **Step 4: Створити messages/uk.json**

```json
{
  "meta": {
    "title": "Дарунок — ідеальний подарунок за 30 секунд",
    "description": "Генератор ідей для подарунків з AI"
  },
  "header": {
    "logo": "Дарунок",
    "about": "Про сервіс"
  },
  "form": {
    "title": "Знайди ідеальний подарунок",
    "subtitle": "Заповни параметри — AI підбере ідеї саме для цієї людини",
    "gender": {
      "label": "Стать",
      "male": "Чоловік",
      "female": "Жінка",
      "any": "Без різниці"
    },
    "ageGroup": {
      "label": "Вік",
      "0-12": "0–12 років",
      "13-17": "13–17 років",
      "18-35": "18–35 років",
      "35-60": "35–60 років",
      "60+": "60+ років"
    },
    "budget": {
      "label": "Бюджет",
      "under-300": "до 300 грн",
      "300-1000": "300–1000 грн",
      "1000-3000": "1000–3000 грн",
      "3000+": "від 3000 грн"
    },
    "occasion": {
      "label": "Привід",
      "birthday": "День народження",
      "new-year": "Новий рік",
      "wedding": "Весілля",
      "march-8": "8 березня",
      "feb-14": "14 лютого",
      "graduation": "Випускний",
      "just-because": "Просто так"
    },
    "relationship": {
      "label": "Ваші стосунки",
      "mom": "Мама",
      "dad": "Тато",
      "friend": "Друг/подруга",
      "partner": "Партнер",
      "colleague": "Колега",
      "child": "Дитина",
      "grandparent": "Бабуся/дідусь"
    },
    "interests": {
      "label": "Хобі та інтереси",
      "sports": "🏃 Спорт",
      "cooking": "🍳 Кулінарія",
      "gaming": "🎮 Ігри",
      "music": "🎵 Музика",
      "reading": "📚 Читання",
      "travel": "✈️ Подорожі",
      "tech": "💻 Технології",
      "crafts": "🎨 Рукоділля",
      "movies": "🎬 Кіно"
    },
    "personality": {
      "label": "Характер",
      "active": "Активний",
      "calm": "Спокійний",
      "creative": "Творчий",
      "practical": "Практичний"
    },
    "giftType": {
      "label": "Тип подарунку",
      "physical": "🎁 Фізичний",
      "experience": "🎭 Враження",
      "digital": "📱 Цифровий"
    },
    "submit": "Знайти подарунок",
    "submitting": "Шукаємо ідеї..."
  },
  "results": {
    "title": "Ідеї для подарунків",
    "findOnRozetka": "Знайти на Rozetka",
    "tryAgain": "Спробувати ще раз",
    "error": "Щось пішло не так. Спробуй ще раз."
  },
  "about": {
    "title": "Про сервіс",
    "description": "Дарунок — безкоштовний AI-генератор ідей для подарунків. Просто вкажи параметри людини, і ми підберемо персоналізовані ідеї з посиланнями на пошук у Rozetka."
  }
}
```

- [ ] **Step 5: Створити messages/en.json**

```json
{
  "meta": {
    "title": "Darunok — perfect gift in 30 seconds",
    "description": "AI gift idea generator"
  },
  "header": {
    "logo": "Darunok",
    "about": "About"
  },
  "form": {
    "title": "Find the perfect gift",
    "subtitle": "Fill in the details — AI will find ideas tailored to this person",
    "gender": {
      "label": "Gender",
      "male": "Male",
      "female": "Female",
      "any": "Any"
    },
    "ageGroup": {
      "label": "Age",
      "0-12": "0–12 years",
      "13-17": "13–17 years",
      "18-35": "18–35 years",
      "35-60": "35–60 years",
      "60+": "60+ years"
    },
    "budget": {
      "label": "Budget",
      "under-300": "under 300 UAH",
      "300-1000": "300–1000 UAH",
      "1000-3000": "1000–3000 UAH",
      "3000+": "3000+ UAH"
    },
    "occasion": {
      "label": "Occasion",
      "birthday": "Birthday",
      "new-year": "New Year",
      "wedding": "Wedding",
      "march-8": "March 8",
      "feb-14": "Valentine's Day",
      "graduation": "Graduation",
      "just-because": "Just because"
    },
    "relationship": {
      "label": "Your relationship",
      "mom": "Mom",
      "dad": "Dad",
      "friend": "Friend",
      "partner": "Partner",
      "colleague": "Colleague",
      "child": "Child",
      "grandparent": "Grandparent"
    },
    "interests": {
      "label": "Hobbies & Interests",
      "sports": "🏃 Sports",
      "cooking": "🍳 Cooking",
      "gaming": "🎮 Gaming",
      "music": "🎵 Music",
      "reading": "📚 Reading",
      "travel": "✈️ Travel",
      "tech": "💻 Tech",
      "crafts": "🎨 Crafts",
      "movies": "🎬 Movies"
    },
    "personality": {
      "label": "Personality",
      "active": "Active",
      "calm": "Calm",
      "creative": "Creative",
      "practical": "Practical"
    },
    "giftType": {
      "label": "Gift type",
      "physical": "🎁 Physical",
      "experience": "🎭 Experience",
      "digital": "📱 Digital"
    },
    "submit": "Find gift ideas",
    "submitting": "Searching ideas..."
  },
  "results": {
    "title": "Gift ideas",
    "findOnRozetka": "Find on Rozetka",
    "tryAgain": "Try again",
    "error": "Something went wrong. Please try again."
  },
  "about": {
    "title": "About",
    "description": "Darunok is a free AI-powered gift idea generator. Just enter details about the recipient and we'll suggest personalized ideas with links to Rozetka search."
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: configure next-intl with UA/EN translations"
git push
```

---

## Task 4: Gemini API route

**Files:**
- Create: `lib/gemini.ts`, `app/api/generate/route.ts`
- Test: `lib/gemini.test.ts`

- [ ] **Step 1: Написати тест для buildPrompt у lib/gemini.test.ts**

```ts
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
```

- [ ] **Step 2: Запустити тест — переконатись що FAIL**

```bash
npx vitest run lib/gemini.test.ts
```
Очікується: FAIL з "Cannot find module './gemini'"

- [ ] **Step 3: Реалізувати lib/gemini.ts**

```ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GiftFormParams, GiftIdea } from './types'

const GENDER_UK: Record<string, string> = {
  male: 'чоловік', female: 'жінка', any: 'без різниці',
}
const INTEREST_UK: Record<string, string> = {
  sports: 'спорт', cooking: 'кулінарія', gaming: 'ігри', music: 'музика',
  reading: 'читання', travel: 'подорожі', tech: 'технології', crafts: 'рукоділля', movies: 'кіно',
}
const INTEREST_EN: Record<string, string> = {
  sports: 'sports', cooking: 'cooking', gaming: 'gaming', music: 'music',
  reading: 'reading', travel: 'travel', tech: 'tech', crafts: 'crafts', movies: 'movies',
}
const OCCASION_UK: Record<string, string> = {
  birthday: 'день народження', 'new-year': 'новий рік', wedding: 'весілля',
  'march-8': '8 березня', 'feb-14': '14 лютого', graduation: 'випускний', 'just-because': 'просто так',
}
const RELATIONSHIP_UK: Record<string, string> = {
  mom: 'мама', dad: 'тато', friend: 'друг/подруга', partner: 'партнер',
  colleague: 'колега', child: 'дитина', grandparent: 'бабуся/дідусь',
}
const PERSONALITY_UK: Record<string, string> = {
  active: 'активний', calm: 'спокійний', creative: 'творчий', practical: 'практичний',
}
const GIFT_TYPE_UK: Record<string, string> = {
  physical: 'фізичний', experience: 'враження/досвід', digital: 'цифровий',
}

export function buildPrompt(params: GiftFormParams, locale: string): string {
  const isUk = locale === 'uk'
  const parts: string[] = []

  if (params.gender) parts.push(isUk ? `стать: ${GENDER_UK[params.gender]}` : `gender: ${params.gender}`)
  if (params.ageGroup) parts.push(isUk ? `вік: ${params.ageGroup} років` : `age: ${params.ageGroup}`)
  if (params.budget) parts.push(isUk ? `бюджет: ${params.budget} грн` : `budget: ${params.budget} UAH`)
  if (params.occasion) parts.push(isUk ? `привід: ${OCCASION_UK[params.occasion]}` : `occasion: ${params.occasion}`)
  if (params.relationship) parts.push(isUk ? `стосунки: ${RELATIONSHIP_UK[params.relationship]}` : `relationship: ${params.relationship}`)
  if (params.interests.length) {
    const map = isUk ? INTEREST_UK : INTEREST_EN
    parts.push((isUk ? 'інтереси: ' : 'interests: ') + params.interests.map(i => map[i]).join(', '))
  }
  if (params.personality) parts.push(isUk ? `характер: ${PERSONALITY_UK[params.personality]}` : `personality: ${params.personality}`)
  if (params.giftType) parts.push(isUk ? `тип подарунку: ${GIFT_TYPE_UK[params.giftType]}` : `gift type: ${params.giftType}`)

  const desc = parts.length ? parts.join(', ') : (isUk ? 'загальні ідеї' : 'general ideas')

  if (isUk) {
    return `Ти — експерт з підбору подарунків для українського ринку.
Параметри отримувача: ${desc}.

Запропонуй рівно 6 оригінальних ідей подарунків. Відповідай ВИКЛЮЧНО у форматі JSON — масив з 6 об'єктів.
Кожен об'єкт має такі поля:
- "title": назва подарунку українською (коротко, 2-5 слів)
- "description": чому саме цей подарунок підходить (1-2 речення українською)
- "emoji": одне підходяще emoji
- "searchQuery": пошуковий запит для Rozetka (українською або транслітом, 2-4 слова)

Приклад формату:
[{"title":"Бездротові навушники","description":"Ідеально для любителів музики та активного відпочинку.","emoji":"🎧","searchQuery":"бездротові навушники"}]

Відповідай ТІЛЬКИ JSON, без пояснень.`
  }

  return `You are a gift idea expert for the Ukrainian market.
Recipient parameters: ${desc}.

Suggest exactly 6 original gift ideas. Respond ONLY in JSON format — array of 6 objects.
Each object has these fields:
- "title": gift name in English (short, 2-5 words)
- "description": why this gift fits (1-2 sentences in English)
- "emoji": one relevant emoji
- "searchQuery": search query for Rozetka (in Ukrainian or transliteration, 2-4 words)

Example format:
[{"title":"Wireless Headphones","description":"Perfect for music lovers and active people.","emoji":"🎧","searchQuery":"бездротові навушники"}]

Respond ONLY with JSON, no explanations.`
}

export async function generateGiftIdeas(
  params: GiftFormParams,
  locale: string,
): Promise<GiftIdea[]> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = buildPrompt(params, locale)
  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response format from Gemini')

  const ideas: Array<Omit<GiftIdea, 'rozetkaUrl'>> = JSON.parse(jsonMatch[0])

  return ideas.map(idea => ({
    ...idea,
    rozetkaUrl: `https://rozetka.com.ua/search/?text=${encodeURIComponent(idea.searchQuery)}`,
  }))
}
```

- [ ] **Step 4: Запустити тест — переконатись що PASS**

```bash
npx vitest run lib/gemini.test.ts
```
Очікується: PASS (3 tests)

- [ ] **Step 5: Написати API route у app/api/generate/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { generateGiftIdeas } from '@/lib/gemini'
import type { GenerateRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { params, locale } = body

    if (!params) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const ideas = await generateGiftIdeas(params, locale ?? 'uk')
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add Gemini API route and prompt builder"
git push
```

---

## Task 5: ChipSelect компонент

**Files:**
- Create: `components/chip-select/chip-select.tsx`, `components/chip-select/chip-select.module.css`
- Test: `components/chip-select/chip-select.test.tsx`

- [ ] **Step 1: Написати тест для ChipSelect**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChipSelect } from './chip-select'

const options = [
  { value: 'male', label: 'Чоловік' },
  { value: 'female', label: 'Жінка' },
]

describe('ChipSelect', () => {
  it('renders all options', () => {
    render(<ChipSelect options={options} value={null} onChange={vi.fn()} />)
    expect(screen.getByText('Чоловік')).toBeInTheDocument()
    expect(screen.getByText('Жінка')).toBeInTheDocument()
  })

  it('calls onChange when chip clicked', () => {
    const onChange = vi.fn()
    render(<ChipSelect options={options} value={null} onChange={onChange} />)
    fireEvent.click(screen.getByText('Чоловік'))
    expect(onChange).toHaveBeenCalledWith('male')
  })

  it('marks selected chip as active', () => {
    render(<ChipSelect options={options} value="female" onChange={vi.fn()} />)
    const chip = screen.getByText('Жінка').closest('button')
    expect(chip).toHaveAttribute('data-active', 'true')
  })

  it('supports multi-select mode', () => {
    const onChange = vi.fn()
    render(
      <ChipSelect
        options={options}
        value={['male']}
        onChange={onChange}
        multi
      />
    )
    fireEvent.click(screen.getByText('Жінка'))
    expect(onChange).toHaveBeenCalledWith(['male', 'female'])
  })
})
```

- [ ] **Step 2: Запустити тест — переконатись що FAIL**

```bash
npx vitest run components/chip-select/chip-select.test.tsx
```

- [ ] **Step 3: Реалізувати chip-select.tsx**

```tsx
'use client'
import styles from './chip-select.module.css'

interface ChipOption {
  value: string
  label: string
}

interface ChipSelectProps {
  options: ChipOption[]
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  multi?: boolean
}

export function ChipSelect({ options, value, onChange, multi = false }: ChipSelectProps) {
  function handleClick(optionValue: string) {
    if (multi) {
      const current = (value as string[]) ?? []
      const next = current.includes(optionValue)
        ? current.filter(v => v !== optionValue)
        : [...current, optionValue]
      onChange(next)
    } else {
      onChange(optionValue)
    }
  }

  function isActive(optionValue: string): boolean {
    if (multi) return ((value as string[]) ?? []).includes(optionValue)
    return value === optionValue
  }

  return (
    <div className={styles.chips}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className={styles.chip}
          data-active={isActive(option.value)}
          onClick={() => handleClick(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Написати chip-select.module.css**

```css
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 14px;
  font-family: var(--font-body);
  transition: all var(--transition);
  white-space: nowrap;
}

.chip:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
  background: var(--color-surface-hover);
}

.chip[data-active='true'] {
  background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end));
  border-color: transparent;
  color: #ffffff;
}
```

- [ ] **Step 5: Запустити тест — переконатись що PASS**

```bash
npx vitest run components/chip-select/chip-select.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add ChipSelect component"
git push
```

---

## Task 6: GiftForm компонент

**Files:**
- Create: `components/gift-form/gift-form.tsx`, `components/gift-form/gift-form.module.css`

- [ ] **Step 1: Реалізувати gift-form.tsx**

```tsx
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
```

- [ ] **Step 2: Написати gift-form.module.css**

```css
.form {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.header {
  text-align: center;
  margin-bottom: 48px;
}

.title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 16px;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.submit {
  margin-top: 40px;
  width: 100%;
  padding: 16px 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end));
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  font-family: var(--font-body);
  transition: opacity var(--transition), transform var(--transition);
}

.submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add GiftForm component"
git push
```

---

## Task 7: GiftCard та SkeletonCard компоненти

**Files:**
- Create: `components/gift-card/gift-card.tsx`, `components/gift-card/gift-card.module.css`
- Create: `components/skeleton-card/skeleton-card.tsx`, `components/skeleton-card/skeleton-card.module.css`

- [ ] **Step 1: Реалізувати gift-card.tsx**

```tsx
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
      <a
        href={idea.rozetkaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.button}
      >
        {t('findOnRozetka')} →
      </a>
    </div>
  )
}
```

- [ ] **Step 2: Написати gift-card.module.css**

```css
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: border-color var(--transition), transform var(--transition);
}

.card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.emoji {
  font-size: 2.5rem;
  line-height: 1;
}

.content {
  flex: 1;
}

.title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--color-text);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
}

.description {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.button {
  display: inline-block;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end));
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  transition: opacity var(--transition);
}

.button:hover {
  opacity: 0.85;
}
```

- [ ] **Step 3: Реалізувати skeleton-card.tsx**

```tsx
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
```

- [ ] **Step 4: Написати skeleton-card.module.css**

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-hover) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.emoji {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title { height: 22px; width: 60%; }
.line { height: 14px; width: 100%; }
.lineShort { height: 14px; width: 75%; }
.button { height: 38px; width: 160px; border-radius: var(--radius-full); }
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add GiftCard and SkeletonCard components"
git push
```

---

## Task 8: GiftResults компонент

**Files:**
- Create: `components/gift-results/gift-results.tsx`, `components/gift-results/gift-results.module.css`

- [ ] **Step 1: Реалізувати gift-results.tsx з Framer Motion**

```tsx
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
```

- [ ] **Step 2: Написати gift-results.module.css**

```css
.section {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.error {
  text-align: center;
  padding: 40px 24px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.reset {
  padding: 10px 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 14px;
  transition: all var(--transition);
}

.reset:hover {
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add GiftResults component with stagger animation"
git push
```

---

## Task 9: Header компонент

**Files:**
- Create: `components/header/header.tsx`, `components/header/header.module.css`

- [ ] **Step 1: Реалізувати header.tsx**

```tsx
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
```

- [ ] **Step 2: Написати header.module.css**

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  background: linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navLink {
  font-size: 14px;
  color: var(--color-text-muted);
  transition: color var(--transition);
}

.navLink:hover {
  color: var(--color-text);
}

.langSwitch {
  display: flex;
  gap: 4px;
}

.langBtn {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: all var(--transition);
}

.langBtn[data-active='true'] {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.langBtn:hover:not([data-active='true']) {
  color: var(--color-text);
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add Header with language switcher"
git push
```

---

## Task 10: Головна сторінка та About

**Files:**
- Modify: `app/[locale]/page.tsx`
- Create: `app/[locale]/about/page.tsx`

- [ ] **Step 1: Реалізувати app/[locale]/page.tsx**

```tsx
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
```

- [ ] **Step 2: Реалізувати app/[locale]/about/page.tsx**

```tsx
import { useTranslations } from 'next-intl'
import { Header } from '@/components/header/header'

export default function AboutPage() {
  const t = useTranslations('about')

  return (
    <>
      <Header />
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '24px' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '16px' }}>
          {t('description')}
        </p>
      </main>
    </>
  )
}
```

- [ ] **Step 3: Перевірити що сайт працює локально**

```bash
npm run dev
```

Відкрити http://localhost:3000 — переконатись що:
- Форма відображається
- Форма перемикає чипи
- Кнопка сабмітить
- Скелетон показується під час завантаження
- Картки з'являються з анімацією
- Посилання на Rozetka відкриваються
- Перемикач мови працює

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: wire up main page and about page"
git push
```

---

## Task 11: Деплой на Vercel

**Files:** немає змін у коді

- [ ] **Step 1: Встановити Vercel CLI і задеплоїти**

```bash
npx vercel --prod
```

Слідувати інтерактивним підказкам: підтвердити проект, вибрати акаунт.

- [ ] **Step 2: Додати env змінну GEMINI_API_KEY у Vercel**

```bash
npx vercel env add GEMINI_API_KEY production
```

Вставити значення ключа з `.env.local`.

- [ ] **Step 3: Зробити редеплой з env**

```bash
npx vercel --prod
```

- [ ] **Step 4: Перевірити production URL**

Відкрити URL що видав Vercel, перевірити що генерація працює.

- [ ] **Step 5: Commit production URL у README**

```bash
echo "# Gift Generator\n\nLive: <vercel-url>" > README.md
git add README.md && git commit -m "feat: add README with production URL"
git push
```

---

## Запуск всіх тестів

```bash
npx vitest run
```

Очікується: всі тести PASS.
