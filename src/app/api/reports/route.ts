import { NextResponse } from 'next/server'
import { buildAirtableRecord, createAirtableRecord } from '@/lib/airtable'
import type { ReportSubmitRequest, ReportSubmitResponse } from '@/types'

export async function POST(request: Request): Promise<NextResponse<ReportSubmitResponse>> {
  try {
    const body = await request.json() as ReportSubmitRequest
    const { manualFields, analysis, customFields } = body

    if (!manualFields || !analysis) {
      return NextResponse.json(
        { success: false, error: 'Date lipsă: manualFields și analysis sunt obligatorii' },
        { status: 400 }
      )
    }

    const record = buildAirtableRecord(manualFields, analysis, customFields)
    const recordId = await createAirtableRecord(record)

    return NextResponse.json({ success: true, recordId })
  } catch (error) {
    console.error('Eroare Airtable:', error)
    const message = error instanceof Error ? error.message : 'Eroare la trimiterea în Airtable'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
