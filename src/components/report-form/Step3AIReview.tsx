'use client'

import { useState } from 'react'
import { SuggestionCard } from '@/components/ai-suggestions/SuggestionCard'
import { WCAGBadge } from '@/components/shared/WCAGBadge'
import { PriorityBadge, ComplexityBadge } from '@/components/shared/PriorityBadge'
import type { AIAnalysisResult, AISuggestion, CustomField, Prioritizare, NivelComplexitate, WCAGLevel, EchipaDeInteres } from '@/types'
import { getEffectiveValue } from '@/types'
import type { FieldOptions } from '@/app/api/airtable-meta/route'

interface Step3Props {
  analysis: AIAnalysisResult
  customFieldDefs: CustomField[]
  airtableOptions: FieldOptions
  onUpdateSuggestion: (field: keyof AIAnalysisResult, update: Partial<AISuggestion>) => void
  onUpdateCustomSuggestion: (fieldId: string, update: Partial<AISuggestion>) => void
  onSubmit: () => Promise<void>
  onBack: () => void
  isSubmitting: boolean
  error: string | null
}

export function Step3AIReview({
  analysis,
  customFieldDefs,
  airtableOptions,
  onUpdateSuggestion,
  onUpdateCustomSuggestion,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: Step3Props) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    await onSubmit()
    setSubmitted(true)
  }

  const wcagValue = getEffectiveValue(analysis.wcag) ?? ''
  const priorityValue = getEffectiveValue(analysis.prioritizare) as Prioritizare | undefined
  const complexityValue = getEffectiveValue(analysis.nivelComplexitate) as NivelComplexitate | undefined

  return (
    <div className="space-y-5">
      {/* Sumarul de sus */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Sumar:</span>
        {wcagValue && <WCAGBadge criterion={wcagValue} />}
        {priorityValue && <PriorityBadge priority={priorityValue} />}
        {complexityValue && <ComplexityBadge complexity={complexityValue} />}
        <span className="text-sm text-gray-500 ml-auto">
          Acceptă, editează sau respinge fiecare sugestie
        </span>
      </div>

      {/* Problema */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Problema</h3>
        <SuggestionCard
          label="Descriere problemă"
          suggestion={analysis.problema as AISuggestion<string>}
          onAccept={() => onUpdateSuggestion('problema', { accepted: true, rejected: false })}
          onEdit={(v) => onUpdateSuggestion('problema', { edited: true, accepted: false, rejected: false, userValue: v })}
          onReject={() => onUpdateSuggestion('problema', { rejected: true, accepted: false, edited: false })}
          multiline
        />
      </section>

      {/* Clasificare WCAG */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Clasificare WCAG</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SuggestionCard
            label="Criteriu WCAG"
            suggestion={analysis.wcag as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('wcag', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('wcag', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('wcag', { rejected: true, accepted: false, edited: false })}
            hint="Format: X.X.X (ex: 1.4.3)"
          />
          <SuggestionCard
            label="Nivel WCAG"
            suggestion={analysis.wcagCategori as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('wcagCategori', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('wcagCategori', { edited: true, accepted: false, rejected: false, userValue: v as WCAGLevel })}
            onReject={() => onUpdateSuggestion('wcagCategori', { rejected: true, accepted: false, edited: false })}
            selectOptions={airtableOptions['WCAG Type']?.length ? airtableOptions['WCAG Type'] : ['A', 'AA', 'AAA']}
          />
        </div>
      </section>

      {/* Soluții */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Soluții</h3>
        <div className="space-y-3">
          <SuggestionCard
            label="Soluție non-tehnică"
            suggestion={analysis.solutiaNonTehnica as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('solutiaNonTehnica', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('solutiaNonTehnica', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('solutiaNonTehnica', { rejected: true, accepted: false, edited: false })}
            multiline
            hint="Explicație pentru client non-tehnic"
          />
          <SuggestionCard
            label="Soluție tehnică (cod)"
            suggestion={analysis.solutiaTehnica as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('solutiaTehnica', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('solutiaTehnica', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('solutiaTehnica', { rejected: true, accepted: false, edited: false })}
            multiline
            hint="Fix tehnic recomandat cu cod"
          />
        </div>
      </section>

      {/* Metadata */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Metadata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SuggestionCard
            label="Dizabilitate afectată"
            suggestion={analysis.dizabilitate as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('dizabilitate', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('dizabilitate', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('dizabilitate', { rejected: true, accepted: false, edited: false })}
            selectOptions={airtableOptions['Dizabilitate']?.length ? airtableOptions['Dizabilitate'] : undefined}
          />
          <SuggestionCard
            label="Echipă de interes"
            suggestion={analysis.echipaDeInteres as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('echipaDeInteres', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('echipaDeInteres', { edited: true, accepted: false, rejected: false, userValue: v as EchipaDeInteres })}
            onReject={() => onUpdateSuggestion('echipaDeInteres', { rejected: true, accepted: false, edited: false })}
            selectOptions={airtableOptions['Echipa De Interes']?.length ? airtableOptions['Echipa De Interes'] : ['Design', 'Dev', 'Content']}
          />
          <SuggestionCard
            label="Prioritizare"
            suggestion={analysis.prioritizare as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('prioritizare', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('prioritizare', { edited: true, accepted: false, rejected: false, userValue: v as Prioritizare })}
            onReject={() => onUpdateSuggestion('prioritizare', { rejected: true, accepted: false, edited: false })}
            selectOptions={airtableOptions['Prioritizare']?.length ? airtableOptions['Prioritizare'] : ['Gold', 'Silver', 'Bronze']}
          />
          <SuggestionCard
            label="Nivel de complexitate"
            suggestion={analysis.nivelComplexitate as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('nivelComplexitate', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('nivelComplexitate', { edited: true, accepted: false, rejected: false, userValue: v as NivelComplexitate })}
            onReject={() => onUpdateSuggestion('nivelComplexitate', { rejected: true, accepted: false, edited: false })}
            selectOptions={airtableOptions['Nivel de complexitate']?.length ? airtableOptions['Nivel de complexitate'] : ['Mare', 'Medie', 'Mica']}
          />
        </div>
      </section>

      {/* Câmpuri custom AI-generate */}
      {customFieldDefs.filter((f) => f.aiGenerated).length > 0 && analysis.customFields && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Câmpuri personalizate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customFieldDefs
              .filter((f) => f.aiGenerated)
              .map((field) => {
                const suggestion = analysis.customFields?.[field.id]
                if (!suggestion) return null
                return (
                  <SuggestionCard
                    key={field.id}
                    label={field.label}
                    suggestion={suggestion as AISuggestion<string>}
                    onAccept={() => onUpdateCustomSuggestion(field.id, { accepted: true, rejected: false })}
                    onEdit={(v) => onUpdateCustomSuggestion(field.id, { edited: true, accepted: false, rejected: false, userValue: v })}
                    onReject={() => onUpdateCustomSuggestion(field.id, { rejected: true, accepted: false, edited: false })}
                    selectOptions={field.type === 'select' ? field.options : undefined}
                  />
                )
              })}
          </div>
        </section>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2 border-t">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          ← Înapoi
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || submitted}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-500 text-white font-medium text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Trimitere în Airtable...
            </>
          ) : (
            '✓ Trimite în Airtable'
          )}
        </button>
      </div>
    </div>
  )
}
