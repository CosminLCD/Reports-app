import { NextResponse } from 'next/server'
import { z } from 'zod'

const { regenerateSingleField } = process.env.GEMINI_API_KEY
  ? await import('@/lib/gemini')
  : await import('@/lib/anthropic')

const manualFieldsSchema = z.object({
  client: z.string().min(1),
  pages: z.array(z.object({
    pageName: z.string().min(1),
    pageLink: z.string().min(1),
    appWebsiteName: z.string().default(''),
  })).min(1),
  device: z.array(z.string()).min(1),
  operatingSystem: z.array(z.string()).min(1),
  browser: z.array(z.string()).min(1),
})

const requestSchema = z.object({
  field: z.enum(['shortDescription', 'problem', 'solution', 'technicalSolution']),
  comment: z.string().min(1),
  currentValue: z.string(),
  manualFields: manualFieldsSchema,
  descriereScurta: z.string(),
  codSursa: z.string().optional(),
  images: z.array(z.object({ base64: z.string(), mimeType: z.string() })).optional(),
})

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as unknown

    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Date invalide: ' + parsed.error.message },
        { status: 400 }
      )
    }

    const { field, comment, currentValue, manualFields, descriereScurta, codSursa, images } = parsed.data

    const value = await regenerateSingleField(
      field,
      currentValue,
      comment,
      manualFields,
      descriereScurta,
      codSursa,
      images,
    )

    return NextResponse.json({ success: true, value })
  } catch (error) {
    console.error('Eroare regenerare câmp AI:', error)
    const provider = process.env.GEMINI_API_KEY ? 'Gemini' : 'Anthropic'
    return NextResponse.json(
      { success: false, error: `Eroare server. Verificați API key-ul ${provider}.` },
      { status: 500 }
    )
  }
}
