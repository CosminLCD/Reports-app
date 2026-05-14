import Anthropic from '@anthropic-ai/sdk'
import { buildAccessibilityAnalysisPrompt, buildFieldRegenerationPrompt, type PromptSelectOptions, type RegenerableField } from './prompts'
import { makeSuggestion, type AIAnalysisResult, type ManualFields, type CustomField } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 10 * 60 * 1000,
  maxRetries: 2,
})

interface RawAnalysis {
  problem: string
  shortDescription: string
  solution: string
  technicalSolution: string
  wcag: string
  wcagLevel: string
  wcagCategory: string
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
    wcagCategory: makeSuggestion(raw.wcagCategory ?? ''),
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

  console.time('anthropic:analyze')
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: contentBlocks }],
  })
  console.timeEnd('anthropic:analyze')

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('[anthropic:analyze] Răspuns fără JSON. stop_reason:', message.stop_reason, '| usage:', message.usage, '| text:', responseText)
    if (message.stop_reason === 'max_tokens') {
      throw new Error('Răspunsul AI a fost trunchiat (max_tokens). Crește limita sau simplifică promptul.')
    }
    throw new Error('Răspunsul AI nu conține JSON valid')
  }

  try {
    const rawAnalysis: RawAnalysis = JSON.parse(jsonMatch[0])
    return transformToAISuggestions(rawAnalysis)
  } catch (parseError) {
    console.error('[anthropic:analyze] JSON.parse a eșuat. stop_reason:', message.stop_reason, '| usage:', message.usage, '| text:', responseText)
    throw parseError
  }
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

  console.time('anthropic:regenerate')
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: contentBlocks }],
  })
  console.timeEnd('anthropic:regenerate')
  if (message.stop_reason === 'max_tokens') {
    console.warn('[anthropic:regenerate] Răspuns trunchiat (max_tokens).', { usage: message.usage })
  }

  return message.content[0].type === 'text' ? message.content[0].text.trim() : ''
}
