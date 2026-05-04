import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildAccessibilityAnalysisPrompt } from './prompts'
import { makeSuggestion, type AIAnalysisResult, type ManualFields, type CustomField } from '@/types'

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
