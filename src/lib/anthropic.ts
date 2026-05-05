import Anthropic from '@anthropic-ai/sdk'
import { buildAccessibilityAnalysisPrompt } from './prompts'
import { makeSuggestion, type AIAnalysisResult, type ManualFields, type CustomField } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface RawAnalysis {
  problem: string
  shortDescription: string
  solution: string
  technicalSolution: string
  wcag: string
  wcagLevel: string
  disability: string
  teamOfInterest: string
  prioritization: string
  levelOfComplexity: string
  customFields?: Record<string, string>
}

function transformToAISuggestions(raw: RawAnalysis): AIAnalysisResult {
  const customFields = raw.customFields
    ? Object.fromEntries(
        Object.entries(raw.customFields).map(([k, v]) => [k, makeSuggestion(v)])
      )
    : undefined

  return {
    problem: makeSuggestion(raw.problem ?? ''),
    shortDescription: makeSuggestion(raw.shortDescription ?? ''),
    solution: makeSuggestion(raw.solution ?? ''),
    technicalSolution: makeSuggestion(raw.technicalSolution ?? ''),
    wcag: makeSuggestion(raw.wcag ?? ''),
    wcagLevel: makeSuggestion((raw.wcagLevel ?? '') as AIAnalysisResult['wcagLevel']['value']),
    disability: makeSuggestion(raw.disability ?? ''),
    teamOfInterest: makeSuggestion(raw.teamOfInterest ?? ''),
    prioritization: makeSuggestion(raw.prioritization ?? ''),
    levelOfComplexity: makeSuggestion(raw.levelOfComplexity ?? ''),
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
