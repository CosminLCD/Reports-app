// ─── Enums & Literals ────────────────────────────────────────────────────────

export type WCAGLevel = 'A' | 'AA' | 'AAA'
export type CustomFieldType = 'text' | 'select' | 'number'

// ─── Manual Fields (Pasul 1) ──────────────────────────────────────────────────

export interface ManualFields {
  client: string
  pageName: string
  pageLink: string
  appWebsiteName: string
  device: string[]
  operatingSystem: string[]
  browser: string[]
}

// ─── Image Data ───────────────────────────────────────────────────────────────

export interface ImageData {
  base64: string
  mimeType: string
  previewUrl: string
  fileName: string
}

// ─── AI Suggestions ───────────────────────────────────────────────────────────

export interface AISuggestion<T = string> {
  value: T
  accepted: boolean
  edited: boolean
  rejected: boolean
  userValue?: T
}

export function getEffectiveValue<T>(s: AISuggestion<T>): T | undefined {
  if (s.rejected) return undefined
  if (s.edited && s.userValue !== undefined) return s.userValue
  return s.value
}

export function makeSuggestion<T>(value: T): AISuggestion<T> {
  return { value, accepted: false, edited: false, rejected: false }
}

export interface AIAnalysisResult {
  problem: AISuggestion<string>
  shortDescription: AISuggestion<string>
  solution: AISuggestion<string>
  technicalSolution: AISuggestion<string>
  wcag: AISuggestion<string>
  wcagLevel: AISuggestion<WCAGLevel>
  disability: AISuggestion<string>
  teamOfInterest: AISuggestion<string>
  prioritization: AISuggestion<string>
  levelOfComplexity: AISuggestion<string>
  customFields?: Record<string, AISuggestion<string>>
}

// ─── Custom Fields ────────────────────────────────────────────────────────────

export interface CustomField {
  id: string
  label: string
  airtableColumnName: string
  type: CustomFieldType
  options?: string[]
  aiGenerated: boolean
  required: boolean
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  manualFields: ManualFields
  descriereScurta: string
  codSursa?: string
  imageBase64?: string
  imageMimeType?: string
  customFields?: CustomField[]
}

export interface AnalyzeResponse {
  success: boolean
  analysis?: AIAnalysisResult
  error?: string
}

export interface ReportSubmitRequest {
  manualFields: ManualFields
  analysis: AIAnalysisResult
  customFields?: CustomField[]
}

export interface ReportSubmitResponse {
  success: boolean
  recordId?: string
  error?: string
}

// ─── Airtable Record ──────────────────────────────────────────────────────────

export interface AirtableRecord {
  Client: string
  'Page Name': string[]
  'Page Link': string[]
  'App/Website Name': string[]
  Device: string[]
  'Operating System': string[]
  Browser: string[]
  Problem: string
  'Short Description': string
  Solution: string
  'Technical Solution': string
  Disability?: string[]
  WCAG?: string
  'WCAG Level'?: string
  'Team of Interest'?: string[]
  Prioritization?: string
  'Level of complexity'?: string
  [key: string]: string | string[] | undefined
}
