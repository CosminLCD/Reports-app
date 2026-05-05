import { NextResponse } from 'next/server'

export interface SourcePage {
  id: string
  client: string
  pageName: string
  pageLink: string
  appWebsiteName: string
}

type AirtableRecord = {
  id: string
  fields: {
    Client?: string
    'Page Name'?: string | string[]
    'Page Link'?: string | string[]
    'App/Website Name'?: string | string[]
  }
}

function firstVal(v: string | string[] | undefined): string {
  if (!v) return ''
  return Array.isArray(v) ? (v[0] ?? '') : v
}

export async function GET(): Promise<NextResponse> {
  const baseId = process.env.AIRTABLE_SOURCE_BASE_ID
  const tableName = process.env.AIRTABLE_SOURCE_TABLE_NAME ?? 'Website Pages'
  const apiKey = process.env.AIRTABLE_API_KEY

  if (!baseId) {
    return NextResponse.json(
      { success: false, error: 'AIRTABLE_SOURCE_BASE_ID lipsă din .env.local' },
      { status: 500 }
    )
  }

  try {
    const allRecords: AirtableRecord[] = []
    let offset: string | undefined

    do {
      const params = new URLSearchParams()
      params.append('fields[]', 'Client')
      params.append('fields[]', 'Page Name')
      params.append('fields[]', 'Page Link')
      params.append('fields[]', 'App/Website Name')
      if (offset) params.append('offset', offset)

      const res = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          next: { revalidate: 60 },
        }
      )

      if (!res.ok) {
        const err = await res.text()
        return NextResponse.json(
          { success: false, error: `Airtable error (${res.status}): ${err}` },
          { status: res.status }
        )
      }

      const data = await res.json() as { records: AirtableRecord[]; offset?: string }
      allRecords.push(...data.records)
      offset = data.offset
    } while (offset)

    const pages: SourcePage[] = allRecords
      .map((r) => ({
        id: r.id,
        client: typeof r.fields['Client'] === 'string' ? r.fields['Client'] : '',
        pageName: firstVal(r.fields['Page Name']),
        pageLink: firstVal(r.fields['Page Link']),
        appWebsiteName: firstVal(r.fields['App/Website Name']),
      }))
      .filter((p) => p.client || p.pageName)

    return NextResponse.json({ success: true, pages })
  } catch (error) {
    console.error('Eroare airtable-source:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
