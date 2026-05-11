// ─── Enums & Literals ────────────────────────────────────────────────────────

export type WCAGLevel = 'A' | 'AA' | 'AAA'
export type CustomFieldType = 'text' | 'select' | 'number'

// ─── Manual Fields (Pasul 1) ──────────────────────────────────────────────────

export interface PageEntry {
  pageName: string
  pageLink: string
  appWebsiteName: string
}

export interface ManualFields {
  client: string
  pages: PageEntry[]
  device: string[]
  operatingSystem: string[]
  browser: string[]
}

// ─── Step 1 Memory ────────────────────────────────────────────────────────────

export interface Step1Memory {
  manualFields: ManualFields
  customValues: Record<string, string>
  savedAt: string
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
  wcagCategory: AISuggestion<string>
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
  images?: Array<{ base64: string; mimeType: string }>
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
  images?: Array<{ base64: string; mimeType: string; fileName: string }>
}

export interface ReportSubmitResponse {
  success: boolean
  recordId?: string
  error?: string
  imageError?: string
}

// ─── Airtable Record ──────────────────────────────────────────────────────────

export interface AirtableRecord {
  Client: string
  'Page Name': string[]
  'Page Link': string
  'App/Website Name': string[]
  Device: string[]
  'Operating System': string[]
  Browser: string[]
  Problem: string
  'Short Description': string
  Solution: string
  'Technical Solution': string
  Disability?: string[]
  WCAG?: string[]
  'WCAG Level'?: string
  'WCAG Category'?: string[]
  'Team of Interest'?: string[]
  Prioritization?: string
  'Level of complexity'?: string
  [key: string]: string | string[] | undefined
}
