'use client'

import { Code2 } from 'lucide-react'
import { MultiImageUpload } from '@/components/shared/ImageUpload'
import type { ImageData } from '@/types'

interface Step2Props {
  images: ImageData[]
  aiImages: ImageData[]
  descriereScurta: string
  codSursa: string
  onImagesChange: (data: ImageData[]) => void
  onAiImagesChange: (data: ImageData[]) => void
  onDescriereChange: (v: string) => void
  onCodSursaChange: (v: string) => void
  onAnalyze: () => void
  onManualMode: () => void
  onBack: () => void
  isAnalyzing: boolean
  error: string | null
  hasExistingAnalysis?: boolean
  onContinueToStep3?: () => void
}

const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'

export function Step2ImageAndDesc({
  images,
  aiImages,
  descriereScurta,
  codSursa,
  onImagesChange,
  onAiImagesChange,
  onDescriereChange,
  onCodSursaChange,
  onAnalyze,
  onManualMode,
  onBack,
  isAnalyzing,
  error,
  hasExistingAnalysis,
  onContinueToStep3,
}: Step2Props) {
  const canAnalyze = descriereScurta.trim().length >= 10

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Screenshot element <span className="text-xs font-normal text-gray-400">(se atașează în Airtable + analizate de AI)</span>
        </label>
        <MultiImageUpload values={images} onChange={onImagesChange} />
      </div>

      <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 space-y-2">
        <label className="block text-sm font-medium text-purple-800">
          Imagini suplimentare doar pentru AI
          <span className="ml-1 text-xs font-normal text-purple-500">(nu se trimit în Airtable)</span>
        </label>
        <MultiImageUpload values={aiImages} onChange={onAiImagesChange} />
        <p className="text-xs text-purple-500">
          Adaugă capturi extra (ex: alte stări ale elementului, context) pe care vrei să le vadă AI-ul la analiză.
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
        <div className="flex gap-2">
          {hasExistingAnalysis && onContinueToStep3 && (
            <button
              onClick={onContinueToStep3}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-lg border border-green-400 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continuă la analiza existentă →
            </button>
          )}
          <button
            onClick={onManualMode}
            disabled={isAnalyzing}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Completare manuală
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
    </div>
  )
}
