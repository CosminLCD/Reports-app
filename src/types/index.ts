// ─── Enums & Literals ────────────────────────────────────────────────────────

export type WCAGLevel = 'A' | 'AA' | 'AAA'
export type EchipaDeInteres = 'Design' | 'Dev' | 'Content'
export type Prioritizare = string   // valori custom din Airtable (ex: Gold, Silver, Bronze)
export type NivelComplexitate = 'Mare' | 'Medie' | 'Mica'
export type Device = string
export type CustomFieldType = 'text' | 'select' | 'number'

// ─── Manual Fields (Pasul 1) ──────────────────────────────────────────────────

export interface ManualFields {
  client: string
  numePagina: string
  linkPagina: string
  device: Device
  sistemDeOperare: string
  browser: string
}

// ─── Image Data ───────────────────────────────────────────────────────────────

export interface ImageData {
  base64: string        // fără prefixul "data:image/...;base64,"
  mimeType: string      // "image/png" | "image/jpeg" | "image/webp" | "image/gif"
  previewUrl: string    // data URL complet pentru preview
  fileName: string
}

// ─── AI Suggestions ───────────────────────────────────────────────────────────

export interface AISuggestion<T = string> {
  value: T
  accepted: boolean     // acceptat fără modificări
  edited: boolean       // modificat de utilizator
  rejected: boolean     // respins — necesită completare manuală
  userValue?: T         // valoarea introdusă de utilizator (dacă edited)
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
  problema: AISuggestion<string>
  solutiaNonTehnica: AISuggestion<string>
  solutiaTehnica: AISuggestion<string>
  wcag: AISuggestion<string>
  wcagCategori: AISuggestion<WCAGLevel>
  dizabilitate: AISuggestion<string>
  echipaDeInteres: AISuggestion<EchipaDeInteres>
  prioritizare: AISuggestion<Prioritizare>
  nivelComplexitate: AISuggestion<NivelComplexitate>
  customFields?: Record<string, AISuggestion<string>>
}

// ─── Custom Fields ────────────────────────────────────────────────────────────

export interface CustomField {
  id: string
  label: string
  airtableColumnName: string
  type: CustomFieldType
  options?: string[]      // pentru type === 'select'
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
  // Câmpuri text — obligatorii
  Client: string
  'Page Name': string
  'Page Link': string
  Device: string
  'Sistem de operare': string
  Browser: string[]
  Problema: string
  'Soluție': string
  'Soluție Tehnică': string
  // Câmpuri select — opționale (omise dacă goale, evită erori Airtable)
  Dizabilitate?: string
  WCAG?: string
  'WCAG Type'?: string
  'Echipa De Interes'?: string
  Prioritizare?: string
  'Nivel de complexitate'?: string
  [key: string]: string | string[] | undefined
}
