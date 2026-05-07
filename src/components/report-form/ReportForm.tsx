'use client'

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
  const { options: airtableOptions, fieldNames } = useAirtableOptions()

  const {
    step,
    manualFields,
    images,
    aiImages,
    descriereScurta,
    codSursa,
    aiAnalysis,
    isAnalyzing,
    isSubmitting,
    isManualMode,
    error,
    customFields,
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
    regenerateField,
    submitReport,
  } = useReportForm()

  const handleSubmit = async (): Promise<boolean> => {
    const { recordId, imageError } = await submitReport()
    if (recordId) {
      const params = new URLSearchParams({ id: recordId })
      if (imageError) params.set('imageError', imageError)
      router.push(`/report/success?${params}`)
      return true
    }
    return false
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <StepIndicator currentStep={step} onGoToStep={goToStep} />

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
          preFilled={preFilled}
          onDismissPreFilled={dismissPreFilled}
        />
      )}

      {step === 2 && isAnalyzing && <LoadingAnalysis />}

      {step === 2 && !isAnalyzing && (
        <Step2ImageAndDesc
          images={images}
          aiImages={aiImages}
          descriereScurta={descriereScurta}
          codSursa={codSursa}
          onImagesChange={setImages}
          onAiImagesChange={setAiImages}
          onDescriereChange={setDescriereScurta}
          onCodSursaChange={setCodSursa}
          onAnalyze={() => triggerAnalysis({
            teamOfInterest: airtableOptions[fieldNames.team],
            disability: airtableOptions[fieldNames.disability],
            prioritization: airtableOptions[fieldNames.prioritization],
            levelOfComplexity: airtableOptions[fieldNames.complexity],
          })}
          onManualMode={enableManualMode}
          onBack={() => goToStep(1)}
          isAnalyzing={isAnalyzing}
          error={error}
          hasExistingAnalysis={!!aiAnalysis}
          onContinueToStep3={() => goToStep(3)}
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
          onRegenerateField={regenerateField}
          onSubmit={handleSubmit}
          onBack={() => goToStep(2)}
          isSubmitting={isSubmitting}
          isManualMode={isManualMode}
          error={error}
        />
      )}
    </div>
  )
}
