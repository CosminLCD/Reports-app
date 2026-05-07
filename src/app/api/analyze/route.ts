import { NextResponse } from 'next/server'
import { z } from 'zod'
import type { AnalyzeResponse } from '@/types'

const { analyzeAccessibilityIssue } = process.env.GEMINI_API_KEY
  ? await import('@/lib/gemini')
  : await import('@/lib/anthropic')

const manualFieldsSchema = z.object({
  client: z.string().min(1),
  pageName: z.string().min(1),
  pageLink: z.string().min(1),
  appWebsiteName: z.string().default(''),
  device: z.array(z.string()).min(1),
  operatingSystem: z.array(z.string()).min(1),
  browser: z.array(z.string()).min(1),
})

const imageSchema = z.object({
  base64: z.string(),
  mimeType: z.string(),
})

const requestSchema = z.object({
  manualFields: manualFieldsSchema,
  descriereScurta: z.string().min(5),
  codSursa: z.string().optional(),
  images: z.array(imageSchema).optional(),
  customFields: z.array(z.any()).optional(),
  selectOptions: z.record(z.string(), z.array(z.string())).optional(),
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

    const { manualFields, descriereScurta, codSursa, images, customFields, selectOptions } = parsed.data

    // Verifică dimensiunea totală a imaginilor (max 5MB fiecare)
    if (images) {
      for (const img of images) {
        if (img.base64.length > 7_000_000) {
          return NextResponse.json(
            { success: false, error: 'O imagine depășește limita de 5MB' },
            { status: 400 }
          )
        }
      }
    }

    const analysis = await analyzeAccessibilityIssue(
      manualFields,
      descriereScurta,
      codSursa,
      images,
      customFields,
      selectOptions
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
