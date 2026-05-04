import { getEffectiveValue, type AirtableRecord, type AIAnalysisResult, type CustomField, type ManualFields } from '@/types'

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME ?? 'Issues')}`

// Câmpurile select nu acceptă string gol — le omitem dacă nu au valoare
function setIfNotEmpty(record: AirtableRecord, key: string, value: string | string[] | undefined) {
  if (!value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.every(v => !v.trim()))) return
  record[key] = value
}

export function buildAirtableRecord(
  manualFields: ManualFields,
  analysis: AIAnalysisResult,
  customFieldDefs?: CustomField[]
): AirtableRecord {
  const record: AirtableRecord = {
    Client: manualFields.client,
    'Page Name': manualFields.numePagina,
    'Page Link': manualFields.linkPagina,
    Device: manualFields.device,
    'Sistem de operare': manualFields.sistemDeOperare,
    Browser: [manualFields.browser],
    Problema: getEffectiveValue(analysis.problema) ?? '',
    'Soluție': getEffectiveValue(analysis.solutiaNonTehnica) ?? '',
    'Soluție Tehnică': getEffectiveValue(analysis.solutiaTehnica) ?? '',
  }

  // Câmpuri select — trimise doar dacă au valoare
  setIfNotEmpty(record, 'WCAG', getEffectiveValue(analysis.wcag))
  setIfNotEmpty(record, 'WCAG Type', getEffectiveValue(analysis.wcagCategori))
  setIfNotEmpty(record, 'Dizabilitate', getEffectiveValue(analysis.dizabilitate))
  setIfNotEmpty(record, 'Echipa De Interes', getEffectiveValue(analysis.echipaDeInteres))
  setIfNotEmpty(record, 'Prioritizare', getEffectiveValue(analysis.prioritizare))
  setIfNotEmpty(record, 'Nivel de complexitate', getEffectiveValue(analysis.nivelComplexitate))

  // Câmpuri custom
  if (customFieldDefs && analysis.customFields) {
    for (const field of customFieldDefs) {
      const suggestion = analysis.customFields[field.id]
      if (suggestion) {
        setIfNotEmpty(record, field.airtableColumnName, getEffectiveValue(suggestion))
      }
    }
  }

  return record
}

export async function createAirtableRecord(
  fields: AirtableRecord
): Promise<string> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  })

  if (!response.ok) {
    const error = await response.text()
    // Afișează URL-ul (fără cheia API) pentru debugging
    const debugUrl = `https://airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_NAME}`
    throw new Error(`Eroare Airtable (${response.status}): ${error}\nURL apelat: ${debugUrl}`)
  }

  const result = await response.json() as { id: string }
  return result.id
}
