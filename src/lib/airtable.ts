import { getEffectiveValue, type AIAnalysisResult, type CustomField, type ManualFields } from '@/types'

const TABLE_NAME_ENCODED = encodeURIComponent(process.env.AIRTABLE_TABLE_NAME ?? 'Website Reports')
const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${TABLE_NAME_ENCODED}`

const F = {
  CLIENT:       process.env.AIRTABLE_FIELD_CLIENT       ?? 'Client',
  IMAGE_ELEMENT:process.env.AIRTABLE_FIELD_IMAGE_ELEMENT ?? 'Image Element',
  PAGE_NAME:    process.env.AIRTABLE_FIELD_PAGE_NAME    ?? 'Page Name',
  PAGE_LINK:    process.env.AIRTABLE_FIELD_PAGE_LINK    ?? 'Page Link',
  APP_NAME:     process.env.AIRTABLE_FIELD_APP_NAME     ?? 'App/Website Name',
  DEVICE:       process.env.AIRTABLE_FIELD_DEVICE       ?? 'Device',
  OS:           process.env.AIRTABLE_FIELD_OS           ?? 'Operating System',
  BROWSER:      process.env.AIRTABLE_FIELD_BROWSER      ?? 'Browser',
  PROBLEM:      process.env.AIRTABLE_FIELD_PROBLEM      ?? 'Problem',
  SHORT_DESC:   process.env.AIRTABLE_FIELD_SHORT_DESC   ?? 'Short Description',
  SOLUTION:     process.env.AIRTABLE_FIELD_SOLUTION     ?? 'Solution',
  TECH_SOLUTION:process.env.AIRTABLE_FIELD_TECH_SOLUTION?? 'Technical Solution',
  WCAG:         process.env.AIRTABLE_FIELD_WCAG         ?? 'WCAG',
  WCAG_LEVEL:   process.env.AIRTABLE_FIELD_WCAG_LEVEL   ?? 'WCAG Level',
  DISABILITY:   process.env.AIRTABLE_FIELD_DISABILITY   ?? 'Disability',
  TEAM:         process.env.AIRTABLE_FIELD_TEAM         ?? 'Team of Interest',
  PRIORITIZATION: process.env.AIRTABLE_FIELD_PRIORITIZATION ?? 'Prioritization',
  COMPLEXITY:   process.env.AIRTABLE_FIELD_COMPLEXITY   ?? 'Level of complexity',
}

type AirtableAttachment = { url: string; filename?: string }
type AirtableFields = Record<string, string | string[] | AirtableAttachment[] | undefined>

function setIfNotEmpty(record: AirtableFields, key: string, value: string | string[] | undefined) {
  if (!value) return
  if (typeof value === 'string' && value.trim() === '') return
  if (Array.isArray(value) && value.every(v => typeof v === 'string' && !v.trim())) return
  record[key] = value
}

export async function uploadToImgBB(base64: string, fileName: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) throw new Error('IMGBB_API_KEY lipsă — adaugă cheia în .env.local')

  const form = new FormData()
  form.append('image', base64)
  form.append('name', fileName)

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`ImgBB upload eșuat (${res.status}): ${err}`)
  }
  const data = await res.json() as { data: { url: string } }
  return data.data.url
}

export function buildAirtableRecord(
  manualFields: ManualFields,
  analysis: AIAnalysisResult,
  customFieldDefs?: CustomField[],
  imageAttachments?: AirtableAttachment[]
): AirtableFields {
  const record: AirtableFields = {
    [F.CLIENT]:       manualFields.client,
    [F.PAGE_NAME]:    manualFields.pageName,
    [F.PAGE_LINK]:    manualFields.pageLink,
    [F.APP_NAME]:     manualFields.appWebsiteName,
    [F.DEVICE]:       manualFields.device,
    [F.OS]:           manualFields.operatingSystem,
    [F.BROWSER]:      manualFields.browser,
    [F.PROBLEM]:      getEffectiveValue(analysis.problem) ?? '',
    [F.SHORT_DESC]:   getEffectiveValue(analysis.shortDescription) ?? '',
    [F.SOLUTION]:     getEffectiveValue(analysis.solution) ?? '',
    [F.TECH_SOLUTION]:getEffectiveValue(analysis.technicalSolution) ?? '',
  }

  setIfNotEmpty(record, F.WCAG, getEffectiveValue(analysis.wcag))
  setIfNotEmpty(record, F.WCAG_LEVEL, getEffectiveValue(analysis.wcagLevel))

  const disability = getEffectiveValue(analysis.disability)
  if (disability) record[F.DISABILITY] = [disability]

  const team = getEffectiveValue(analysis.teamOfInterest)
  if (team) record[F.TEAM] = [team]

  setIfNotEmpty(record, F.PRIORITIZATION, getEffectiveValue(analysis.prioritization))
  setIfNotEmpty(record, F.COMPLEXITY, getEffectiveValue(analysis.levelOfComplexity))

  if (customFieldDefs && analysis.customFields) {
    for (const field of customFieldDefs) {
      const suggestion = analysis.customFields[field.id]
      if (suggestion) {
        setIfNotEmpty(record, field.airtableColumnName, getEffectiveValue(suggestion))
      }
    }
  }

  if (imageAttachments && imageAttachments.length > 0) {
    record[F.IMAGE_ELEMENT] = imageAttachments
  }

  return record
}

export async function createAirtableRecord(fields: AirtableFields): Promise<string> {
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
    throw new Error(`Eroare Airtable (${response.status}): ${error}`)
  }

  const result = await response.json() as { id: string }
  return result.id
}
