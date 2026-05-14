import { NextResponse } from 'next/server'

export const revalidate = 60

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

export interface FieldNames {
  client: string
  pageName: string
  pageLink: string
  appName: string
  device: string
  os: string
  browser: string
  problem: string
  shortDesc: string
  solution: string
  techSolution: string
  wcag: string
  wcagLevel: string
  wcagCategory: string
  disability: string
  team: string
  prioritization: string
  complexity: string
}

function getFieldNames(): FieldNames {
  return {
    client: process.env.AIRTABLE_FIELD_CLIENT ?? 'Client',
    pageName: process.env.AIRTABLE_FIELD_PAGE_NAME ?? 'Page Name',
    pageLink: process.env.AIRTABLE_FIELD_PAGE_LINK ?? 'Page Link',
    appName: process.env.AIRTABLE_FIELD_APP_NAME ?? 'App/Website Name',
    device: process.env.AIRTABLE_FIELD_DEVICE ?? 'Device',
    os: process.env.AIRTABLE_FIELD_OS ?? 'Operating System',
    browser: process.env.AIRTABLE_FIELD_BROWSER ?? 'Browser',
    problem: process.env.AIRTABLE_FIELD_PROBLEM ?? 'Problem',
    shortDesc: process.env.AIRTABLE_FIELD_SHORT_DESC ?? 'Short Description',
    solution: process.env.AIRTABLE_FIELD_SOLUTION ?? 'Solution',
    techSolution: process.env.AIRTABLE_FIELD_TECH_SOLUTION ?? 'Technical Solution',
    wcag: process.env.AIRTABLE_FIELD_WCAG ?? 'WCAG',
    wcagLevel: process.env.AIRTABLE_FIELD_WCAG_LEVEL ?? 'WCAG Level',
    wcagCategory: process.env.AIRTABLE_FIELD_WCAG_CATEGORY ?? 'WCAG Category',
    disability: process.env.AIRTABLE_FIELD_DISABILITY ?? 'Disability',
    team: process.env.AIRTABLE_FIELD_TEAM ?? 'Team of Interest',
    prioritization: process.env.AIRTABLE_FIELD_PRIORITIZATION ?? 'Prioritization',
    complexity: process.env.AIRTABLE_FIELD_COMPLEXITY ?? 'Level of complexity',
  }
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
        cache: 'no-store',
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

    const fieldNames = getFieldNames()

    return NextResponse.json({ success: true, fieldOptions, fieldNames })
  } catch (error) {
    console.error('Eroare Airtable Meta:', error)
    return NextResponse.json({ success: false, error: 'Nu s-au putut încărca opțiunile' }, { status: 500 })
  }
}
