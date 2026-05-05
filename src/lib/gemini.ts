import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildAccessibilityAnalysisPrompt } from './prompts'
import { makeSuggestion, type AIAnalysisResult, type ManualFields, type CustomField } from '@/types'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

  const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = []

  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    })
  }

  parts.push({ text: textPrompt })

  const result = await model.generateContent({ contents: [{ role: 'user', parts }] })
  const responseText = result.response.text()

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Răspunsul Gemini nu conține JSON valid')
  }

  const rawAnalysis: RawAnalysis = JSON.parse(jsonMatch[0])
  return transformToAISuggestions(rawAnalysis)
}
