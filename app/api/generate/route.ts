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
