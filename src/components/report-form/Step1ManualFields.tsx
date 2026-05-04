'use client'

import type { ManualFields, CustomField } from '@/types'
import type { FieldOptions } from '@/app/api/airtable-meta/route'

const DEVICES = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
] as const

const OS_FALLBACK = ['Windows 10', 'Windows 11', 'macOS', 'Ubuntu', 'Android', 'iOS', 'ChromeOS']
const BROWSER_FALLBACK = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Samsung Internet']

interface Step1Props {
  fields: ManualFields
  onChange: (fields: ManualFields) => void
  customFields: CustomField[]
  customValues: Record<string, string>
  onCustomChange: (id: string, value: string) => void
  onNext: () => void
  airtableOptions: FieldOptions
}

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

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'

function SelectField({ value, onChange, options, fallback }: {
  value: string
  onChange: (v: string) => void
  options: string[]
  fallback: string[]
}) {
  const list = options.length ? options : fallback
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      <option value="">Selectează...</option>
      {list.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export function Step1ManualFields({ fields, onChange, customFields, customValues, onCustomChange, onNext, airtableOptions }: Step1Props) {
  const update = (key: keyof ManualFields, value: string) =>
    onChange({ ...fields, [key]: value })

  const isValid =
    fields.client.trim() &&
    fields.numePagina.trim() &&
    fields.linkPagina.trim() &&
    fields.sistemDeOperare.trim() &&
    fields.browser.trim()

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Client" required>
          {airtableOptions['Client']?.length ? (
            <SelectField
              value={fields.client}
              onChange={(v) => update('client', v)}
              options={airtableOptions['Client']}
              fallback={[]}
            />
          ) : (
            <input
              type="text"
              value={fields.client}
              onChange={(e) => update('client', e.target.value)}
              placeholder="ex: Primăria Cluj"
              className={inputCls}
            />
          )}
        </Field>

        <Field label="Nume pagină" required>
          <input
            type="text"
            value={fields.numePagina}
            onChange={(e) => update('numePagina', e.target.value)}
            placeholder="ex: Pagina de Contact"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Link pagină" required>
        <input
          type="url"
          value={fields.linkPagina}
          onChange={(e) => update('linkPagina', e.target.value)}
          placeholder="https://..."
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Dispozitiv" required>
          <SelectField
            value={fields.device}
            onChange={(v) => update('device', v)}
            options={airtableOptions['Device'] ?? []}
            fallback={DEVICES.map((d) => d.value)}
          />
        </Field>

        <Field label="Sistem de operare" required>
          <SelectField
            value={fields.sistemDeOperare}
            onChange={(v) => update('sistemDeOperare', v)}
            options={airtableOptions['Sistem de operare'] ?? []}
            fallback={OS_FALLBACK}
          />
        </Field>

        <Field label="Browser" required>
          <SelectField
            value={fields.browser}
            onChange={(v) => update('browser', v)}
            options={airtableOptions['Browser'] ?? []}
            fallback={BROWSER_FALLBACK}
          />
        </Field>
      </div>

      {/* Câmpuri custom manuale */}
      {customFields.filter((f) => !f.aiGenerated).length > 0 && (
        <div className="border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Câmpuri personalizate</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customFields
              .filter((f) => !f.aiGenerated)
              .map((field) => (
                <Field key={field.id} label={field.label} required={field.required}>
                  {field.type === 'select' && field.options ? (
                    <select
                      value={customValues[field.id] ?? ''}
                      onChange={(e) => onCustomChange(field.id, e.target.value)}
                      className={inputCls}
                    >
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
