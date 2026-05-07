'use client'

import { useState, useEffect, useRef } from 'react'
import { SuggestionCard } from '@/components/ai-suggestions/SuggestionCard'
import { WCAGBadge } from '@/components/shared/WCAGBadge'
import { PriorityBadge, ComplexityBadge } from '@/components/shared/PriorityBadge'
import type { AIAnalysisResult, AISuggestion, CustomField } from '@/types'
import { getEffectiveValue } from '@/types'
import type { FieldOptions, FieldNames } from '@/app/api/airtable-meta/route'

function MetadataSelectCard({
  label,
  suggestion,
  options,
  onEdit,
}: {
  label: string
  suggestion: AISuggestion<string>
  options: string[]
  onEdit: (v: string) => void
}) {
  const current = getEffectiveValue(suggestion) ?? ''
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit

  // When options load and no value is set yet, auto-select first option
  // so visual state matches what gets sent to Airtable
  useEffect(() => {
    if (!current && options.length > 0) {
      onEditRef.current(options[0])
    }
  }, [current, options.length])

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        {label}
      </label>
      <select
        value={current || options[0] || ''}
        onChange={(e) => onEdit(e.target.value)}
        className="w-full rounded border border-blue-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

type RegenerableField = 'shortDescription' | 'problem' | 'solution' | 'technicalSolution'

interface Step3Props {
  analysis: AIAnalysisResult
  customFieldDefs: CustomField[]
  airtableOptions: FieldOptions
  fieldNames: FieldNames
  onUpdateSuggestion: (field: keyof AIAnalysisResult, update: Partial<AISuggestion>) => void
  onUpdateCustomSuggestion: (fieldId: string, update: Partial<AISuggestion>) => void
  onRegenerateField: (field: RegenerableField, comment: string) => Promise<void>
  onSubmit: () => Promise<boolean>
  onBack: () => void
  isSubmitting: boolean
  isManualMode?: boolean
  error: string | null
}

export function Step3AIReview({
  analysis,
  customFieldDefs,
  airtableOptions,
  fieldNames,
  onUpdateSuggestion,
  onUpdateCustomSuggestion,
  onRegenerateField,
  onSubmit,
  onBack,
  isSubmitting,
  isManualMode = false,
  error,
}: Step3Props) {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    const success = await onSubmit()
    if (success) setSubmitted(true)
  }

  const wcagValue = getEffectiveValue(analysis.wcag) ?? ''
  const priorityValue = getEffectiveValue(analysis.prioritization)
  const complexityValue = getEffectiveValue(analysis.levelOfComplexity)

  return (
    <div className="space-y-5">
      {/* Banner mod manual */}
      {isManualMode && (
        <div className="rounded-md bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-800">
          Mod manual — câmpurile nu au fost generate de AI. Completați-le și salvați.
        </div>
      )}

      {/* Sumar */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600">Sumar:</span>
        {wcagValue && <WCAGBadge criterion={wcagValue} />}
        {priorityValue && <PriorityBadge priority={priorityValue} />}
        {complexityValue && <ComplexityBadge complexity={complexityValue} />}
        <span className="text-sm text-gray-500 ml-auto">
          {isManualMode ? 'Completați câmpurile manual' : 'Valorile sunt salvate automat — apasă Editează dacă vrei să modifici'}
        </span>
      </div>

      {/* Problema */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Problema</h3>
        <div className="space-y-3">
          <SuggestionCard
            label="Descriere scurtă"
            suggestion={analysis.shortDescription as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('shortDescription', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('shortDescription', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('shortDescription', { rejected: true, accepted: false, edited: false })}
            onRegenerate={(c) => onRegenerateField('shortDescription', c)}
            hint="Max 25 cuvinte"
          />
          <SuggestionCard
            label="Descriere detaliată"
            suggestion={analysis.problem as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('problem', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('problem', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('problem', { rejected: true, accepted: false, edited: false })}
            onRegenerate={(c) => onRegenerateField('problem', c)}
            multiline
          />
        </div>
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
          <MetadataSelectCard
            label="Nivel WCAG"
            suggestion={analysis.wcagLevel as AISuggestion<string>}
            options={airtableOptions[fieldNames.wcagLevel] ?? []}
            onEdit={(v) => onUpdateSuggestion('wcagLevel', { edited: true, accepted: false, rejected: false, userValue: v as 'A' | 'AA' | 'AAA' })}
          />
        </div>
      </section>

      {/* Soluții */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Soluții</h3>
        <div className="space-y-3">
          <SuggestionCard
            label="Soluție non-tehnică"
            suggestion={analysis.solution as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('solution', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('solution', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('solution', { rejected: true, accepted: false, edited: false })}
            onRegenerate={(c) => onRegenerateField('solution', c)}
            multiline
            hint="Explicație pentru client non-tehnic"
          />
          <SuggestionCard
            label="Soluție tehnică (cod)"
            suggestion={analysis.technicalSolution as AISuggestion<string>}
            onAccept={() => onUpdateSuggestion('technicalSolution', { accepted: true, rejected: false })}
            onEdit={(v) => onUpdateSuggestion('technicalSolution', { edited: true, accepted: false, rejected: false, userValue: v })}
            onReject={() => onUpdateSuggestion('technicalSolution', { rejected: true, accepted: false, edited: false })}
            onRegenerate={(c) => onRegenerateField('technicalSolution', c)}
            multiline
            hint="Fix tehnic recomandat cu cod"
          />
        </div>
      </section>

      {/* Metadata */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Metadata</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetadataSelectCard
            label="Dizabilitate afectată"
            suggestion={analysis.disability as AISuggestion<string>}
            options={airtableOptions[fieldNames.disability] ?? []}
            onEdit={(v) => onUpdateSuggestion('disability', { edited: true, accepted: false, rejected: false, userValue: v })}
          />
          <MetadataSelectCard
            label="Echipă de interes"
            suggestion={analysis.teamOfInterest as AISuggestion<string>}
            options={airtableOptions[fieldNames.team] ?? []}
            onEdit={(v) => onUpdateSuggestion('teamOfInterest', { edited: true, accepted: false, rejected: false, userValue: v })}
          />
          <MetadataSelectCard
            label="Prioritizare"
            suggestion={analysis.prioritization as AISuggestion<string>}
            options={airtableOptions[fieldNames.prioritization] ?? []}
            onEdit={(v) => onUpdateSuggestion('prioritization', { edited: true, accepted: false, rejected: false, userValue: v })}
          />
          <MetadataSelectCard
            label="Nivel de complexitate"
            suggestion={analysis.levelOfComplexity as AISuggestion<string>}
            options={airtableOptions[fieldNames.complexity] ?? []}
            onEdit={(v) => onUpdateSuggestion('levelOfComplexity', { edited: true, accepted: false, rejected: false, userValue: v })}
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
