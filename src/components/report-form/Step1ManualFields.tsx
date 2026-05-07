'use client'

import { useMemo } from 'react'
import type { ManualFields, CustomField } from '@/types'
import type { FieldOptions, FieldNames } from '@/app/api/airtable-meta/route'
import { useSourcePages } from '@/hooks/useSourcePages'
import { cn } from '@/lib/utils'

interface Step1Props {
  fields: ManualFields
  onChange: (fields: ManualFields) => void
  customFields: CustomField[]
  customValues: Record<string, string>
  onCustomChange: (id: string, value: string) => void
  onNext: () => void
  airtableOptions: FieldOptions
  fieldNames: FieldNames
  preFilled: boolean
  onDismissPreFilled: () => void
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function MultiCheckbox({ value, onChange, options }: {
  value: string[]
  onChange: (v: string[]) => void
  options: string[]
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])

  if (!options.length) {
    return <p className="text-xs text-gray-400 py-1">Se încarcă opțiunile din Airtable...</p>
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {options.map(opt => (
        <label
          key={opt}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm cursor-pointer select-none transition-colors',
            value.includes(opt)
              ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          )}
        >
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

export function Step1ManualFields({ fields, onChange, customFields, customValues, onCustomChange, onNext, airtableOptions, fieldNames, preFilled, onDismissPreFilled }: Step1Props) {
  const { pages, loading, error: sourceError } = useSourcePages()

  const update = (key: keyof ManualFields, value: string | string[]) =>
    onChange({ ...fields, [key]: value } as ManualFields)

  const clients = useMemo(() => {
    const seen = new Set<string>()
    return pages.map((p) => p.client).filter((c) => c && !seen.has(c) && seen.add(c))
  }, [pages])

  const filteredPages = useMemo(
    () => pages.filter((p) => !fields.client || p.client === fields.client),
    [pages, fields.client]
  )

  const selectedPageIds = useMemo(
    () => new Set(fields.pages.map((p) => p.pageName + '|' + p.pageLink)),
    [fields.pages]
  )

  const handleClientChange = (client: string) => {
    onChange({ ...fields, client, pages: [] })
  }

  const handleAddPage = (pageId: string) => {
    const page = pages.find((p) => p.id === pageId)
    if (!page) return
    const key = page.pageName + '|' + page.pageLink
    if (selectedPageIds.has(key)) return
    onChange({
      ...fields,
      pages: [...fields.pages, { pageName: page.pageName, pageLink: page.pageLink, appWebsiteName: page.appWebsiteName }],
    })
  }

  const handleRemovePage = (index: number) => {
    onChange({ ...fields, pages: fields.pages.filter((_, i) => i !== index) })
  }

  const isValid =
    fields.client.trim() &&
    fields.pages.length > 0 &&
    fields.device.length > 0 &&
    fields.operatingSystem.length > 0 &&
    fields.browser.length > 0

  return (
    <div className="space-y-5">
      {preFilled && (
        <div className="flex items-center justify-between gap-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
          <span>Câmpurile au fost completate automat din raportul anterior. Le poți modifica oricând.</span>
          <button
            type="button"
            onClick={onDismissPreFilled}
            className="shrink-0 text-blue-500 hover:text-blue-700 font-medium transition-colors"
            aria-label="Închide notificarea"
          >
            ✕
          </button>
        </div>
      )}

      {sourceError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-mono break-all">
          {sourceError}
        </div>
      )}

      {/* Client */}
      <Field label="Client" required>
        <select
          value={fields.client}
          onChange={(e) => handleClientChange(e.target.value)}
          className={inputCls}
          disabled={loading}
        >
          <option value="">{loading ? 'Se încarcă...' : 'Selectează client...'}</option>
          {clients.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      {/* Pagini auditate — multi-select */}
      <Field label="Pagini auditate" required>
        <select
          value=""
          onChange={(e) => { handleAddPage(e.target.value); e.target.value = '' }}
          className={inputCls}
          disabled={loading || !fields.client}
        >
          <option value="">{!fields.client ? 'Alege mai întâi clientul' : 'Adaugă pagină...'}</option>
          {filteredPages
            .filter((p) => !selectedPageIds.has(p.pageName + '|' + p.pageLink))
            .map((p) => <option key={p.id} value={p.id}>{p.pageName}</option>)}
        </select>

        {fields.pages.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {fields.pages.map((page, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{page.pageName}</p>
                  <a
                    href={page.pageLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline truncate block max-w-xs"
                  >
                    {page.pageLink}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePage(i)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                  aria-label={`Elimină ${page.pageName}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </Field>

      {/* Device */}
      <Field label="Dispozitiv" required>
        <MultiCheckbox
          value={fields.device}
          onChange={(v) => update('device', v)}
          options={airtableOptions[fieldNames.device] ?? []}
        />
      </Field>

      {/* OS + Browser */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Sistem de operare" required>
          <MultiCheckbox
            value={fields.operatingSystem}
            onChange={(v) => update('operatingSystem', v)}
            options={airtableOptions[fieldNames.os] ?? []}
          />
        </Field>
        <Field label="Browser" required>
          <MultiCheckbox
            value={fields.browser}
            onChange={(v) => update('browser', v)}
            options={airtableOptions[fieldNames.browser] ?? []}
          />
        </Field>
      </div>

      {/* Câmpuri custom manuale */}
      {customFields.filter((f) => !f.aiGenerated).length > 0 && (
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Câmpuri personalizate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customFields.filter((f) => !f.aiGenerated).map((field) => (
              <Field key={field.id} label={field.label} required={field.required}>
                {field.type === 'select' && field.options ? (
                  <select value={customValues[field.id] ?? ''} onChange={(e) => onCustomChange(field.id, e.target.value)} className={inputCls}>
                    <option value="">Selectează...</option>
                    {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={customValues[field.id] ?? ''}
                    onChange={(e) => onCustomChange(field.id, e.target.value)}
                    className={inputCls}
                  />
                )}
              </Field>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continuă →
        </button>
      </div>
    </div>
  )
}
