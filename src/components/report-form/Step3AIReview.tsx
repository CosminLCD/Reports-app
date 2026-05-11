'use client'

import { useState, useEffect, useRef } from 'react'
import { SuggestionCard } from '@/components/ai-suggestions/SuggestionCard'
import { WCAGBadge } from '@/components/shared/WCAGBadge'
import { PriorityBadge, ComplexityBadge } from '@/components/shared/PriorityBadge'
import type { AIAnalysisResult, AISuggestion, CustomField } from '@/types'
import { getEffectiveValue } from '@/types'
import type { FieldOptions, FieldNames } from '@/app/api/airtable-meta/route'
import { getCriterion, getUnderstandingUrl, type WCAGLevel } from '@/lib/wcag-criteria'

function WCAGLevelBadge({ level }: { level: WCAGLevel }) {
  const styles: Record<WCAGLevel, string> = {
    A: 'bg-gray-200 text-gray-700',
    AA: 'bg-blue-200 text-blue-800',
    AAA: 'bg-purple-200 text-purple-800',
  }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${styles[level]}`}>
      {level}
    </span>
  )
}

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

  useEffect(() => {
    if (options.length === 0) return
    if (!current || !options.includes(current)) {
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

function MultiToggleCard({
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
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit

  const parseSelected = (s: AISuggestion<string>, opts: string[]) => {
    const val = getEffectiveValue(s) ?? ''
    const parsed = val
      .split('/')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => opts.find((o) => o.trim() === x))
      .filter((x): x is string => Boolean(x))
    return parsed.length > 0 ? parsed : opts.length > 0 ? [opts[0]] : []
  }

  const [selected, setSelected] = useState<string[]>(() => parseSelected(suggestion, options))

  useEffect(() => {
    if (options.length === 0) return
    const next = parseSelected(suggestion, options)
    setSelected(next)
    onEditRef.current(next.join('/'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion.value, suggestion.userValue, options.length])

  const toggle = (opt: string) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    const final = next.length > 0 ? next : [opt]
    setSelected(final)
    onEditRef.current(final.join('/'))
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3 sm:col-span-2">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              selected.includes(opt)
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function WCAGChipsCard({
  suggestion,
  onEdit,
}: {
  suggestion: AISuggestion<string>
  onEdit: (v: string) => void
}) {
  const onEditRef = useRef(onEdit)
  onEditRef.current = onEdit

  const parseChips = (s: AISuggestion<string>) =>
    (getEffectiveValue(s) ?? '').split('/').map((c) => c.trim()).filter(Boolean)

  const [chips, setChips] = useState<string[]>(() => parseChips(suggestion))
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    const next = parseChips(suggestion)
    setChips(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestion.value, suggestion.userValue])

  const updateChips = (next: string[]) => {
    setChips(next)
    onEditRef.current(next.join('/'))
  }

  const removeChip = (i: number) => {
    const next = chips.filter((_, idx) => idx !== i)
    if (next.length === 0) return
    updateChips(next)
  }

  const addChip = () => {
    const val = inputVal.trim()
    if (!val) return
    if (!/^\d+\.\d+\.\d+$/.test(val)) return
    if (chips.includes(val)) { setInputVal(''); return }
    updateChips([...chips, val])
    setInputVal('')
  }

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-3">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Criteriu WCAG
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {chips.map((chip, i) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 bg-blue-100 border border-blue-300 rounded px-2 py-0.5 text-xs font-mono font-semibold text-blue-800"
          >
            {chip}
            {chips.length > 1 && (
              <button
                type="button"
                onClick={() => removeChip(i)}
                className="text-blue-500 hover:text-red-500 leading-none"
                aria-label={`Elimină ${chip}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {chips.length > 0 && (
        <div className="mb-2 space-y-1.5 rounded bg-white/60 border border-blue-100 p-2">
          {chips.map((num) => {
            const info = getCriterion(num)
            return (
              <div
                key={num}
                className={`flex items-start gap-2 p-1.5 rounded ${info ? '' : 'bg-amber-50 border border-amber-200'}`}
              >
                <span className="font-mono text-xs font-semibold text-blue-800 shrink-0 pt-0.5 w-12">
                  {num}
                </span>
                <div className="flex-1 min-w-0">
                  {info ? (
                    <>
                      <div className="text-xs font-semibold text-gray-800">
                        {info.nameRo}{' '}
                        <span className="font-normal text-gray-400">· {info.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 leading-snug">{info.shortDesc}</div>
                    </>
                  ) : (
                    <div className="text-xs text-amber-700">
                      Criteriu necunoscut — verifică numărul
                    </div>
                  )}
                </div>
                {info && <WCAGLevelBadge level={info.level} />}
                <a
                  href={getUnderstandingUrl(num)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Deschide pagina W3C pentru criteriul ${num}`}
                  className="text-blue-600 hover:text-blue-800 text-sm shrink-0 leading-none pt-0.5"
                  title="Deschide sursa W3C (Understanding)"
                >
                  ↗
                </a>
              </div>
            )
          })}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addChip()}
          placeholder="ex: 2.1.1"
          className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={addChip}
          className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
        >
          + Adaugă
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-400">Format: X.X.X — apasă Enter sau butonul pentru adăugare</p>
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
          <WCAGChipsCard
            suggestion={analysis.wcag as AISuggestion<string>}
            onEdit={(v) => onUpdateSuggestion('wcag', { edited: true, accepted: false, rejected: false, userValue: v })}
          />
          <MetadataSelectCard
            label="Nivel WCAG"
            suggestion={analysis.wcagLevel as AISuggestion<string>}
            options={airtableOptions[fieldNames.wcagLevel] ?? []}
            onEdit={(v) => onUpdateSuggestion('wcagLevel', { edited: true, accepted: false, rejected: false, userValue: v as 'A' | 'AA' | 'AAA' })}
          />
          {(airtableOptions[fieldNames.wcagCategory]?.length ?? 0) > 0 && (
            <MultiToggleCard
              label="Categorie WCAG"
              suggestion={analysis.wcagCategory as AISuggestion<string>}
              options={airtableOptions[fieldNames.wcagCategory] ?? []}
              onEdit={(v) => onUpdateSuggestion('wcagCategory', { edited: true, accepted: false, rejected: false, userValue: v })}
            />
          )}
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
          <MultiToggleCard
            label="Dizabilitate afectată"
            suggestion={analysis.disability as AISuggestion<string>}
            options={airtableOptions[fieldNames.disability] ?? []}
            onEdit={(v) => onUpdateSuggestion('disability', { edited: true, accepted: false, rejected: false, userValue: v })}
          />
          <MultiToggleCard
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
