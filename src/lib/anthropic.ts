import Anthropic from '@anthropic-ai/sdk'
import { buildAccessibilityAnalysisPrompt, buildFieldRegenerationPrompt, type PromptSelectOptions, type RegenerableField } from './prompts'
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

type ImageBlock = {
  type: 'image'
  source: {
    type: 'base64'
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    data: string
  }
}
type TextBlock = { type: 'text'; text: string }

export async function analyzeAccessibilityIssue(
  manualFields: ManualFields,
  descriereScurta: string,
  codSursa?: string,
  images?: Array<{ base64: string; mimeType: string }>,
  customFieldDefs?: CustomField[],
  selectOptions?: PromptSelectOptions
): Promise<AIAnalysisResult> {
  const textPrompt = buildAccessibilityAnalysisPrompt(
    manualFields,
    descriereScurta,
    codSursa,
    customFieldDefs,
    selectOptions
  )

  const contentBlocks: (ImageBlock | TextBlock)[] = []

  if (images && images.length > 0) {
    for (const img of images) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType as ImageBlock['source']['media_type'],
          data: img.base64,
        },
      })
    }
  }

  contentBlocks.push({ type: 'text', text: textPrompt })

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    messages: [{ role: 'user', content: contentBlocks }],
  })

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Răspunsul AI nu conține JSON valid')
  }

  const rawAnalysis: RawAnalysis = JSON.parse(jsonMatch[0])
  return transformToAISuggestions(rawAnalysis)
}

export async function regenerateSingleField(
  field: RegenerableField,
  currentValue: string,
  comment: string,
  manualFields: ManualFields,
  descriereScurta: string,
  codSursa?: string,
  images?: Array<{ base64: string; mimeType: string }>,
): Promise<string> {
  const textPrompt = buildFieldRegenerationPrompt(field, currentValue, comment, manualFields, descriereScurta, codSursa)

  const contentBlocks: (ImageBlock | TextBlock)[] = []

  if (images && images.length > 0) {
    for (const img of images) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType as ImageBlock['source']['media_type'],
          data: img.base64,
        },
      })
    }
  }

  contentBlocks.push({ type: 'text', text: textPrompt })

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: contentBlocks }],
  })

  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}
