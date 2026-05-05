import { getEffectiveValue, type AIAnalysisResult, type CustomField, type ManualFields } from '@/types'

const BASE_URL = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE_NAME ?? 'Website Reports')}`

const F = {
  CLIENT:       process.env.AIRTABLE_FIELD_CLIENT       ?? 'Client',
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

type AirtableFields = Record<string, string | string[] | undefined>

function setIfNotEmpty(record: AirtableFields, key: string, value: string | string[] | undefined) {
  if (!value) return
  if (typeof value === 'string' && value.trim() === '') return
  if (Array.isArray(value) && value.every(v => !v.trim())) return
  record[key] = value
}

export function buildAirtableRecord(
  manualFields: ManualFields,
  analysis: AIAnalysisResult,
  customFieldDefs?: CustomField[]
): AirtableFields {
  const record: AirtableFields = {
    [F.CLIENT]:       manualFields.client,
    [F.PAGE_NAME]:    manualFields.pageName ? [manualFields.pageName] : [],
    [F.PAGE_LINK]:    manualFields.pageLink ? [manualFields.pageLink] : [],
    [F.APP_NAME]:     manualFields.appWebsiteName ? [manualFields.appWebsiteName] : [],
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
