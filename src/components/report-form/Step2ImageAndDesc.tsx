'use client'

import { Code2 } from 'lucide-react'
import { ImageUpload } from '@/components/shared/ImageUpload'
import type { ImageData } from '@/types'

interface Step2Props {
  imageData: ImageData | null
  descriereScurta: string
  codSursa: string
  onImageChange: (data: ImageData | null) => void
  onDescriereChange: (v: string) => void
  onCodSursaChange: (v: string) => void
  onAnalyze: () => void
  onBack: () => void
  isAnalyzing: boolean
  error: string | null
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'

export function Step2ImageAndDesc({
  imageData,
  descriereScurta,
  codSursa,
  onImageChange,
  onDescriereChange,
  onCodSursaChange,
  onAnalyze,
  onBack,
  isAnalyzing,
  error,
}: Step2Props) {
  const canAnalyze = descriereScurta.trim().length >= 10

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Screenshot element
        </label>
        <ImageUpload value={imageData} onChange={onImageChange} />
        <p className="mt-1 text-xs text-gray-400">
          Capturează elementul cu problema. Claude va analiza imaginea vizual.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descriere scurtă a problemei <span className="text-red-500">*</span>
        </label>
        <textarea
          value={descriereScurta}
          onChange={(e) => onDescriereChange(e.target.value)}
          rows={3}
          placeholder="ex: Butonul de submit nu are label accesibil, nu poate fi identificat de screen reader..."
          className={inputCls}
        />
        <p className="mt-1 text-xs text-gray-400">
          Minim 10 caractere. Cu cât descrii mai detaliat, cu atât sugestiile AI sunt mai precise.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="flex items-center gap-1.5">
            <Code2 size={14} />
            Cod sursă relevant (opțional)
          </span>
        </label>
        <textarea
          value={codSursa}
          onChange={(e) => onCodSursaChange(e.target.value)}
          rows={6}
          placeholder={'Lipește codul HTML/CSS/JS relevant\n\n<button onclick="submit()">Trimite</button>'}
          className={`${inputCls} font-mono text-xs`}
          spellCheck={false}
        />
        <p className="mt-1 text-xs text-gray-400">
          Adaugă codul elementului cu problema. Claude va genera fix-ul tehnic adaptat la structura existentă.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={isAnalyzing}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          ← Înapoi
        </button>
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analizare...
            </>
          ) : (
            '✨ Analizează cu AI'
          )}
        </button>
      </div>
    </div>
  )
}
