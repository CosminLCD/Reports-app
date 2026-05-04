import Anthropic from '@anthropic-ai/sdk'
import { buildAccessibilityAnalysisPrompt } from './prompts'
import { makeSuggestion, type AIAnalysisResult, type ManualFields, type CustomField } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RawAnalysis {
  problema: string
  solutiaNonTehnica: string
  solutiaTehnica: string
  wcag: string
  wcagCategori: string
  dizabilitate: string
  echipaDeInteres: string
  prioritizare: string
  nivelComplexitate: string
  customFields?: Record<string, string>
}

function transformToAISuggestions(raw: RawAnalysis): AIAnalysisResult {
  const customFields = raw.customFields
    ? Object.fromEntries(
        Object.entries(raw.customFields).map(([k, v]) => [k, makeSuggestion(v)])
      )
    : undefined

  return {
    problema: makeSuggestion(raw.problema),
    solutiaNonTehnica: makeSuggestion(raw.solutiaNonTehnica),
    solutiaTehnica: makeSuggestion(raw.solutiaTehnica),
    wcag: makeSuggestion(raw.wcag),
    wcagCategori: makeSuggestion(raw.wcagCategori as AIAnalysisResult['wcagCategori']['value']),
    dizabilitate: makeSuggestion(raw.dizabilitate),
    echipaDeInteres: makeSuggestion(raw.echipaDeInteres as AIAnalysisResult['echipaDeInteres']['value']),
    prioritizare: makeSuggestion(raw.prioritizare as AIAnalysisResult['prioritizare']['value']),
    nivelComplexitate: makeSuggestion(raw.nivelComplexitate as AIAnalysisResult['nivelComplexitate']['value']),
    customFields,
  }
}

export async function analyzeAccessibilityIssue(
  manualFields: ManualFields,
  descriereScurta: string,
  codSursa?: string,
  imageBase64?: string,
  imageMimeType?: string,
  customFieldDefs?: CustomField[]
): Promise<AIAnalysisResult> {
  const textPrompt = buildAccessibilityAnalysisPrompt(
    manualFields,
    descriereScurta,
    codSursa,
    customFieldDefs
  )

  type ImageBlock = {
    type: 'image'
    source: {
      type: 'base64'
      media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      data: string
    }
  }
  type TextBlock = { type: 'text'; text: string }

  const contentBlocks: (ImageBlock | TextBlock)[] = []

  if (imageBase64 && imageMimeType) {
    contentBlocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMimeType as ImageBlock['source']['media_type'],
        data: imageBase64,
      },
    })
  }

  contentBlocks.push({ type: 'text', text: textPrompt })

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: contentBlocks,
      },
    ],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  // Extrage JSON din răspuns (în caz că există text extra)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Răspunsul AI nu conține JSON valid')
  }

  const rawAnalysis: RawAnalysis = JSON.parse(jsonMatch[0])
  return transformToAISuggestions(rawAnalysis)
}
