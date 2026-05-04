'use client'

import { useState } from 'react'
import { Plus, Trash2, Bot, User, GripVertical } from 'lucide-react'
import type { CustomField, CustomFieldType } from '@/types'
import { cn } from '@/lib/utils'

interface CustomFieldEditorProps {
  fields: CustomField[]
  onAdd: (field: Omit<CustomField, 'id'>) => void
  onUpdate: (id: string, updates: Partial<CustomField>) => void
  onRemove: (id: string) => void
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'

const emptyField: Omit<CustomField, 'id'> = {
  label: '',
  airtableColumnName: '',
  type: 'text',
  options: [],
  aiGenerated: true,
  required: false,
}

export function CustomFieldEditor({ fields, onAdd, onUpdate, onRemove }: CustomFieldEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [newField, setNewField] = useState<Omit<CustomField, 'id'>>(emptyField)
  const [optionsInput, setOptionsInput] = useState('')

  const handleAdd = () => {
    if (!newField.label.trim() || !newField.airtableColumnName.trim()) return
    const options =
      newField.type === 'select'
        ? optionsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined
    onAdd({ ...newField, options })
    setNewField(emptyField)
    setOptionsInput('')
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      {fields.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          Nu ai câmpuri personalizate. Adaugă primul câmp mai jos.
        </p>
      )}

      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 group"
            >
              <GripVertical size={16} className="text-gray-300 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-800">{field.label}</span>
                  <span className="text-xs text-gray-400">→ {field.airtableColumnName}</span>
                  <span className={cn(
                    'text-xs px-1.5 py-0.5 rounded font-medium',
                    field.aiGenerated
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {field.aiGenerated ? (
                      <span className="flex items-center gap-1"><Bot size={10} /> AI</span>
                    ) : (
                      <span className="flex items-center gap-1"><User size={10} /> Manual</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-400 bg-white border border-gray-200 rounded px-1">{field.type}</span>
                  {field.required && <span className="text-xs text-red-500">obligatoriu</span>}
                </div>
                {field.options && field.options.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">Opțiuni: {field.options.join(', ')}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onUpdate(field.id, { aiGenerated: !field.aiGenerated })}
                  className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-white transition-colors text-gray-600"
                  title="Schimbă între AI și Manual"
                >
                  {field.aiGenerated ? '→ Manual' : '→ AI'}
                </button>
                <button
                  onClick={() => onRemove(field.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label={`Șterge câmpul ${field.label}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-blue-800">Câmp nou</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Etichetă (afișată în UI) *</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))}
                placeholder="ex: Componentă afectată"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Coloană Airtable *</label>
              <input
                type="text"
                value={newField.airtableColumnName}
                onChange={(e) => setNewField((p) => ({ ...p, airtableColumnName: e.target.value }))}
                placeholder="ex: componenta afectata"
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-0.5">Exact cum apare în Airtable</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField((p) => ({ ...p, type: e.target.value as CustomFieldType }))}
                className={inputCls}
              >
                <option value="text">Text</option>
                <option value="select">Select</option>
                <option value="number">Număr</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Completat de</label>
              <select
                value={newField.aiGenerated ? 'ai' : 'manual'}
                onChange={(e) => setNewField((p) => ({ ...p, aiGenerated: e.target.value === 'ai' }))}
                className={inputCls}
              >
                <option value="ai">AI (sugerat automat)</option>
                <option value="manual">Manual (Pasul 1)</option>
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) => setNewField((p) => ({ ...p, required: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Obligatoriu</span>
              </label>
            </div>
          </div>

          {newField.type === 'select' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Opțiuni (separate prin virgulă)</label>
              <input
                type="text"
                value={optionsInput}
                onChange={(e) => setOptionsInput(e.target.value)}
                placeholder="ex: opțiunea 1, opțiunea 2, opțiunea 3"
                className={inputCls}
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={!newField.label.trim() || !newField.airtableColumnName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Plus size={14} /> Adaugă câmp
            </button>
            <button
              onClick={() => { setShowForm(false); setNewField(emptyField); setOptionsInput('') }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors w-full justify-center"
        >
          <Plus size={16} /> Adaugă câmp personalizat
        </button>
      )}
    </div>
  )
}
