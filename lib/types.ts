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
