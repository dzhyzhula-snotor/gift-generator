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
