import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AnalyzeResponse } from '@/types'

// Alege providerul AI în funcție de cheia disponibilă
const { analyzeAccessibilityIssue } = process.env.GEMINI_API_KEY
  ? await import('@/lib/gemini')
  : await import('@/lib/anthropic')

const manualFieldsSchema = z.object({
  client: z.string().min(1),
  numePagina: z.string().min(1),
  linkPagina: z.string().min(1),
  device: z.string().min(1),
  sistemDeOperare: z.string().min(1),
  browser: z.string().min(1),
})

const requestSchema = z.object({
  manualFields: manualFieldsSchema,
  descriereScurta: z.string().min(5),
  codSursa: z.string().optional(),
  imageBase64: z.string().optional(),
  imageMimeType: z.string().optional(),
  customFields: z.array(z.any()).optional(),
})

export async function POST(request: Request): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await request.json() as unknown

    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Date invalide: ' + parsed.error.message },
        { status: 400 }
      )
    }

    const { manualFields, descriereScurta, codSursa, imageBase64, imageMimeType, customFields } = parsed.data

    // Validare dimensiune imagine (max 5MB base64 ≈ ~6.7MB text)
    if (imageBase64 && imageBase64.length > 7_000_000) {
      return NextResponse.json(
        { success: false, error: 'Imaginea depășește limita de 5MB' },
        { status: 400 }
      )
    }

    const analysis = await analyzeAccessibilityIssue(
      manualFields,
      descriereScurta,
      codSursa,
      imageBase64,
      imageMimeType,
      customFields
    )

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('Eroare analiză AI:', error)
    const provider = process.env.GEMINI_API_KEY ? 'Gemini' : 'Anthropic'
    return NextResponse.json(
      { success: false, error: `Eroare server. Verificați API key-ul ${provider}.` },
      { status: 500 }
    )
  }
}
