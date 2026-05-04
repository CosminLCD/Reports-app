'use client'

import { useState, useCallback } from 'react'
import type {
  ManualFields,
  ImageData,
  AIAnalysisResult,
  AISuggestion,
  CustomField,
} from '@/types'
import { makeSuggestion } from '@/types'
import { useCustomFields } from './useCustomFields'

const initialManualFields: ManualFields = {
  client: '',
  numePagina: '',
  linkPagina: '',
  device: 'desktop',
  sistemDeOperare: '',
  browser: '',
}

export type FormStep = 1 | 2 | 3

export function useReportForm() {
  const [step, setStep] = useState<FormStep>(1)
  const [manualFields, setManualFields] = useState<ManualFields>(initialManualFields)
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const [descriereScurta, setDescriereScurta] = useState('')
  const [codSursa, setCodSursa] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { customFields } = useCustomFields()

  const goToStep = useCallback((s: FormStep) => {
    setStep(s)
    setError(null)
  }, [])

  const triggerAnalysis = useCallback(async () => {
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
          imageBase64: imageData?.base64,
          imageMimeType: imageData?.mimeType,
          customFields: customFields.filter((f) => f.aiGenerated),
        }),
      })
      const data = await response.json() as { success: boolean; analysis?: AIAnalysisResult; error?: string }
      if (!data.success || !data.analysis) {
        throw new Error(data.error ?? 'Eroare necunoscută')
      }
      setAiAnalysis(data.analysis)
      setStep(3)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Eroare la analiza AI')
    } finally {
      setIsAnalyzing(false)
    }
  }, [manualFields, descriereScurta, codSursa, imageData, customFields])

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
        const updated: AISuggestion<string> = { ...existing, ...update } as AISuggestion<string>
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
    async (): Promise<string | null> => {
      if (!aiAnalysis) return null
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
          }),
        })
        const data = await response.json() as { success: boolean; recordId?: string; error?: string }
        if (!data.success) {
          throw new Error(data.error ?? 'Eroare la trimiterea raportului')
        }
        return data.recordId ?? null
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Eroare la trimitere')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [aiAnalysis, manualFields, customFields]
  )

  const reset = useCallback(() => {
    setStep(1)
    setManualFields(initialManualFields)
    setImageData(null)
    setDescriereScurta('')
    setCodSursa('')
    setAiAnalysis(null)
    setError(null)
  }, [])

  return {
    step,
    manualFields,
    imageData,
    descriereScurta,
    codSursa,
    aiAnalysis,
    isAnalyzing,
    isSubmitting,
    error,
    customFields,
    goToStep,
    setManualFields,
    setImageData,
    setDescriereScurta,
    setCodSursa,
    triggerAnalysis,
    updateSuggestion,
    updateCustomSuggestion,
    submitReport,
    reset,
  }
}
