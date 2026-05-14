import { NextResponse } from 'next/server'
import { buildAirtableRecord, createAirtableRecord, uploadToImgBB } from '@/lib/airtable'
import type { ReportSubmitRequest, ReportSubmitResponse } from '@/types'

export async function POST(request: Request): Promise<NextResponse<ReportSubmitResponse>> {
  try {
    const body = await request.json() as ReportSubmitRequest
    const { manualFields, analysis, customFields, images } = body

    if (!manualFields || !analysis) {
      return NextResponse.json(
        { success: false, error: 'Date lipsă: manualFields și analysis sunt obligatorii' },
        { status: 400 }
      )
    }

    // Upload imagini la ImgBB înainte de a crea recordul
    let imageAttachments: Array<{ url: string; filename?: string }> = []
    let imageError: string | undefined

    if (images && images.length > 0) {
      if (!process.env.IMGBB_API_KEY) {
        imageError = 'IMGBB_API_KEY lipsă în .env.local — adaugă cheia de la api.imgbb.com pentru a atașa imagini'
      } else {
        const results = await Promise.allSettled(
          images.map((img) => uploadToImgBB(img.base64, img.fileName))
        )
        const errors: string[] = []
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            imageAttachments.push({ url: r.value, filename: images[i].fileName })
          } else {
            const msg = r.reason instanceof Error ? r.reason.message : 'Eroare upload'
            console.error(`[reports] Eroare upload imagine ${images[i].fileName}:`, msg)
            errors.push(msg)
          }
        })
        if (errors.length > 0) {
          imageError = `${errors.length} imagine(i) nu au putut fi atașate: ${errors[0]}`
        }
      }
    }

    const record = buildAirtableRecord(manualFields, analysis, customFields, imageAttachments)
    const recordId = await createAirtableRecord(record)

    return NextResponse.json({ success: true, recordId, imageError })
  } catch (error) {
    console.error('Eroare Airtable:', error)
    const message = error instanceof Error ? error.message : 'Eroare la trimiterea în Airtable'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
