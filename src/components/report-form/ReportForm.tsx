'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepIndicator } from './StepIndicator'
import { Step1ManualFields } from './Step1ManualFields'
import { Step2ImageAndDesc } from './Step2ImageAndDesc'
import { Step3AIReview } from './Step3AIReview'
import { LoadingAnalysis } from '@/components/ai-suggestions/LoadingAnalysis'
import { useReportForm } from '@/hooks/useReportForm'
import { useAirtableOptions } from '@/hooks/useAirtableOptions'
import type { AIAnalysisResult, AISuggestion } from '@/types'

export function ReportForm() {
  const router = useRouter()
  const [customManualValues, setCustomManualValues] = useState<Record<string, string>>({})
  const { options: airtableOptions, fieldNames } = useAirtableOptions()

  const {
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
  } = useReportForm()

  const handleSubmit = async () => {
    const recordId = await submitReport()
    if (recordId) {
      router.push(`/report/success?id=${recordId}`)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <Step1ManualFields
          fields={manualFields}
          onChange={setManualFields}
          customFields={customFields}
          customValues={customManualValues}
          onCustomChange={(id, val) => setCustomManualValues((prev) => ({ ...prev, [id]: val }))}
          onNext={() => goToStep(2)}
          airtableOptions={airtableOptions}
          fieldNames={fieldNames}
        />
      )}

      {step === 2 && isAnalyzing && <LoadingAnalysis />}

      {step === 2 && !isAnalyzing && (
        <Step2ImageAndDesc
          imageData={imageData}
          descriereScurta={descriereScurta}
          codSursa={codSursa}
          onImageChange={setImageData}
          onDescriereChange={setDescriereScurta}
          onCodSursaChange={setCodSursa}
          onAnalyze={triggerAnalysis}
          onBack={() => goToStep(1)}
          isAnalyzing={isAnalyzing}
          error={error}
        />
      )}

      {step === 3 && aiAnalysis && (
        <Step3AIReview
          analysis={aiAnalysis}
          customFieldDefs={customFields}
          airtableOptions={airtableOptions}
          fieldNames={fieldNames}
          onUpdateSuggestion={(field, update) =>
            updateSuggestion(field as keyof AIAnalysisResult, update as Partial<AISuggestion>)
          }
          onUpdateCustomSuggestion={updateCustomSuggestion}
          onSubmit={handleSubmit}
          onBack={() => goToStep(2)}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
    </div>
  )
}
