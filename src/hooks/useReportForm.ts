'use client'

import { useState, useCallback, useEffect } from 'react'
import type {
  ManualFields,
  ImageData,
  AIAnalysisResult,
  AISuggestion,
  CustomField,
  WCAGLevel,
  Step1Memory,
} from '@/types'
import { makeSuggestion } from '@/types'
import { useCustomFields } from './useCustomFields'

const STEP1_MEMORY_KEY = 'apass_last_report_step1'

function loadStep1Memory(): Step1Memory | null {
  try {
    const raw = localStorage.getItem(STEP1_MEMORY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Step1Memory
    if (!parsed?.manualFields || typeof parsed.manualFields.client !== 'string') return null
    const mf = parsed.manualFields
    parsed.manualFields = {
      ...mf,
      device: Array.isArray(mf.device) ? mf.device : [],
      operatingSystem: Array.isArray(mf.operatingSystem) ? mf.operatingSystem : [],
      browser: Array.isArray(mf.browser) ? mf.browser : [],
    }
    return parsed
  } catch {
    return null
  }
}

function saveStep1Memory(manualFields: ManualFields, customValues: Record<string, string>): void {
  try {
    localStorage.setItem(STEP1_MEMORY_KEY, JSON.stringify({ manualFields, customValues, savedAt: new Date().toISOString() }))
  } catch { /* quota exceeded sau private mode */ }
}

function autoAcceptAll(analysis: AIAnalysisResult): AIAnalysisResult {
  const accept = <T>(s: AISuggestion<T>): AISuggestion<T> => ({ ...s, accepted: true, rejected: false, edited: false })
  return {
    ...analysis,
    problem: accept(analysis.problem),
    shortDescription: accept(analysis.shortDescription),
    solution: accept(analysis.solution),
    technicalSolution: accept(analysis.technicalSolution),
    wcag: accept(analysis.wcag),
    wcagLevel: accept(analysis.wcagLevel),
    disability: accept(analysis.disability),
    teamOfInterest: accept(analysis.teamOfInterest),
    prioritization: accept(analysis.prioritization),
    levelOfComplexity: accept(analysis.levelOfComplexity),
    customFields: analysis.customFields
      ? Object.fromEntries(Object.entries(analysis.customFields).map(([k, v]) => [k, accept(v)]))
      : undefined,
  }
}

const initialManualFields: ManualFields = {
  client: '',
  pageName: '',
  pageLink: '',
  appWebsiteName: '',
  device: [],
  operatingSystem: [],
  browser: [],
}

export type FormStep = 1 | 2 | 3

export function useReportForm() {
  const [step, setStep] = useState<FormStep>(1)
  const [manualFields, setManualFields] = useState<ManualFields>(initialManualFields)
  const [images, setImages] = useState<ImageData[]>([])
  const [aiImages, setAiImages] = useState<ImageData[]>([])
  const [descriereScurta, setDescriereScurta] = useState('')
  const [codSursa, setCodSursa] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isManualMode, setIsManualMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customManualValues, setCustomManualValues] = useState<Record<string, string>>({})
  const [preFilled, setPreFilled] = useState(false)

  const { customFields } = useCustomFields()

  useEffect(() => {
    const memory = loadStep1Memory()
    if (!memory) return
    setManualFields(memory.manualFields)
    if (memory.customValues && Object.keys(memory.customValues).length > 0) {
      setCustomManualValues(memory.customValues)
    }
    setPreFilled(true)
  }, [])

  const goToStep = useCallback((s: FormStep) => {
    setStep(s)
    setError(null)
  }, [])

  const triggerAnalysis = useCallback(async (selectOptions?: Record<string, string[]>) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualFields,
          descriereScurta,
          codSursa: codSursa.trim() || undefined,
          images: [...images, ...aiImages].map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
          customFields: customFields.filter((f) => f.aiGenerated),
          selectOptions,
        }),
      })
      const data = await response.json() as { success: boolean; analysis?: AIAnalysisResult; error?: string }
      if (!data.success || !data.analysis) {
        throw new Error(data.error ?? 'Eroare necunoscută')
      }
      setAiAnalysis(autoAcceptAll(data.analysis))
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la analiza AI')
    } finally {
      setIsAnalyzing(false)
    }
  }, [manualFields, descriereScurta, codSursa, images, aiImages, customFields])

  const updateSuggestion = useCallback(
    <K extends keyof AIAnalysisResult>(
      field: K,
      update: Partial<AISuggestion>
    ) => {
      setAiAnalysis((prev) => {
        if (!prev) return prev
        const current = prev[field] as AISuggestion
        return { ...prev, [field]: { ...current, ...update } }
      })
    },
    []
  )

  const updateCustomSuggestion = useCallback(
    (fieldId: string, update: Partial<AISuggestion>) => {
      setAiAnalysis((prev) => {
        if (!prev) return prev
        const existing = prev.customFields?.[fieldId] ?? makeSuggestion('')
        const updated = { ...existing, ...update }
        return {
          ...prev,
          customFields: {
            ...prev.customFields,
            [fieldId]: updated,
          },
        }
      })
    },
    []
  )

  const submitReport = useCallback(
    async (): Promise<{ recordId: string | null; imageError?: string }> => {
      if (!aiAnalysis) return { recordId: null }
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manualFields,
            analysis: aiAnalysis,
            customFields: customFields as CustomField[],
            images: images.map((img) => ({ base64: img.base64, mimeType: img.mimeType, fileName: img.fileName })),
          }),
        })
        const data = await response.json() as { success: boolean; recordId?: string; error?: string; imageError?: string }
        if (!data.success) {
          throw new Error(data.error ?? 'Eroare la trimiterea raportului')
        }
        saveStep1Memory(manualFields, customManualValues)
        return { recordId: data.recordId ?? null, imageError: data.imageError }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la trimitere')
        return { recordId: null }
      } finally {
        setIsSubmitting(false)
      }
    },
    [aiAnalysis, manualFields, customFields, customManualValues, images]
  )

  const enableManualMode = useCallback(() => {
    const emptyAnalysis: AIAnalysisResult = {
      problem: makeSuggestion(''),
      shortDescription: makeSuggestion(''),
      solution: makeSuggestion(''),
      technicalSolution: makeSuggestion(''),
      wcag: makeSuggestion(''),
      wcagLevel: makeSuggestion('AA' as WCAGLevel),
      disability: makeSuggestion(''),
      teamOfInterest: makeSuggestion(''),
      prioritization: makeSuggestion(''),
      levelOfComplexity: makeSuggestion(''),
    }
    setAiAnalysis(autoAcceptAll(emptyAnalysis))
    setIsManualMode(true)
    setStep(3)
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setStep(1)
    setManualFields(initialManualFields)
    setCustomManualValues({})
    setPreFilled(false)
    setImages([])
    setAiImages([])
    setDescriereScurta('')
    setCodSursa('')
    setAiAnalysis(null)
    setError(null)
  }, [])

  const dismissPreFilled = useCallback(() => setPreFilled(false), [])

  return {
    step,
    manualFields,
    images,
    aiImages,
    descriereScurta,
    codSursa,
    aiAnalysis,
    isAnalyzing,
    isSubmitting,
    error,
    customFields,
    isManualMode,
    customManualValues,
    setCustomManualValues,
    preFilled,
    dismissPreFilled,
    goToStep,
    setManualFields,
    setImages,
    setAiImages,
    setDescriereScurta,
    setCodSursa,
    triggerAnalysis,
    enableManualMode,
    updateSuggestion,
    updateCustomSuggestion,
    submitReport,
    reset,
  }
}
