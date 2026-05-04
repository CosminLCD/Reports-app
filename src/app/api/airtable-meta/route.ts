import { NextResponse } from 'next/server'

interface AirtableChoice {
  id: string
  name: string
  color?: string
}

interface AirtableField {
  id: string
  name: string
  type: string
  options?: {
    choices?: AirtableChoice[]
  }
}

interface AirtableTable {
  id: string
  name: string
  fields: AirtableField[]
}

export interface FieldOptions {
  [fieldName: string]: string[]
}

export async function GET(): Promise<NextResponse> {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_TABLE_NAME
    const apiKey = process.env.AIRTABLE_API_KEY

    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 60 }, // cache 60 secunde
      }
    )

    if (!response.ok) {
      throw new Error(`Airtable Meta API error: ${response.status}`)
    }

    const data = await response.json() as { tables: AirtableTable[] }
    const table = data.tables.find((t) => t.name === tableName)

    if (!table) {
      return NextResponse.json({ success: false, error: `Tabelul "${tableName}" nu a fost găsit` }, { status: 404 })
    }

    const fieldOptions: FieldOptions = {}
    for (const field of table.fields) {
      if (
        (field.type === 'singleSelect' || field.type === 'multipleSelects') &&
        field.options?.choices?.length
      ) {
        fieldOptions[field.name] = field.options.choices.map((c) => c.name)
      }
    }

    return NextResponse.json({ success: true, fieldOptions })
  } catch (error) {
    console.error('Eroare Airtable Meta:', error)
    return NextResponse.json({ success: false, error: 'Nu s-au putut încărca opțiunile' }, { status: 500 })
  }
}
