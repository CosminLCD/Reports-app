'use client'

import { useState } from 'react'
import { Save, CheckCircle } from 'lucide-react'
import { CustomFieldEditor } from '@/components/settings/CustomFieldEditor'
import { useCustomFields } from '@/hooks/useCustomFields'

export default function SettingsPage() {
  const { customFields, loaded, addField, updateField, removeField } = useCustomFields()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!loaded) {
    return <div className="text-gray-400 text-sm py-8 text-center">Se încarcă...</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setări</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gestionează câmpurile personalizate care se adaugă la rapoarte.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          {saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saved ? 'Salvat!' : 'Salvează'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-800">Câmpuri personalizate</h2>
          <p className="text-sm text-gray-500 mt-1">
            Adaugă câmpuri extra față de cele standard. Câmpurile <strong>AI</strong> sunt completate
            automat de Claude și apar la Pasul 3 pentru validare. Câmpurile <strong>Manual</strong>
            apar la Pasul 1 pentru completare directă.
          </p>
        </div>

        <CustomFieldEditor
          fields={customFields}
          onAdd={addField}
          onUpdate={updateField}
          onRemove={removeField}
        />
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Conexiune Airtable</h2>
        <p className="text-sm text-gray-500 mb-3">
          Configurează variabilele de mediu în fișierul <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</code> din rădăcina proiectului.
        </p>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-xs space-y-1">
          <p><span className="text-green-400">ANTHROPIC_API_KEY</span>=sk-ant-...</p>
          <p><span className="text-green-400">AIRTABLE_API_KEY</span>=pat...</p>
          <p><span className="text-green-400">AIRTABLE_BASE_ID</span>=app...</p>
          <p><span className="text-green-400">AIRTABLE_TABLE_NAME</span>=Issues</p>
        </div>
      </div>
    </div>
  )
}
