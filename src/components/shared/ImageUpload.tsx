'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ImageData } from '@/types'

interface ImageUploadProps {
  value: ImageData | null
  onChange: (data: ImageData | null) => void
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Format neacceptat. Folosiți PNG, JPG, WebP sau GIF.')
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError('Imaginea depășește limita de 5MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        // Extrage base64 pur (fără prefixul "data:...;base64,")
        const base64 = dataUrl.split(',')[1]
        onChange({
          base64,
          mimeType: file.type,
          previewUrl: dataUrl,
          fileName: file.name,
        })
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // Reset input pentru a permite re-upload același fișier
      e.target.value = ''
    },
    [processFile]
  )

  if (value) {
    return (
      <div className="relative rounded-lg border border-gray-200 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.previewUrl}
          alt={value.fileName}
          className="w-full max-h-64 object-contain bg-gray-50"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
          <span className="text-sm text-gray-600 truncate">{value.fileName}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Elimină imaginea"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de upload imagine — apasă sau trage un fișier"
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          {dragging ? (
            <ImageIcon size={32} className="text-blue-400" />
          ) : (
            <Upload size={32} />
          )}
          <p className="text-sm font-medium">
            {dragging ? 'Eliberează pentru upload' : 'Trage o imagine sau apasă pentru browse'}
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF — max 5MB (opțional)</p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

// ─── Multi Image Upload ───────────────────────────────────────────────────────

interface MultiImageUploadProps {
  values: ImageData[]
  onChange: (data: ImageData[]) => void
  maxImages?: number
}

export function MultiImageUpload({ values, onChange, maxImages = 10 }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const processFiles = useCallback(
    (files: FileList) => {
      setError(null)
      const remaining = maxImages - values.length
      if (remaining <= 0) {
        setError(`Maxim ${maxImages} imagini permise.`)
        return
      }
      const toProcess = Array.from(files).slice(0, remaining)
      const valid = toProcess.filter((f) => {
        if (!ACCEPTED_TYPES.includes(f.type)) { setError('Format neacceptat. Folosiți PNG, JPG, WebP sau GIF.'); return false }
        if (f.size > MAX_SIZE_BYTES) { setError('O imagine depășește limita de 5MB.'); return false }
        return true
      })
      if (valid.length === 0) return

      const results: ImageData[] = []
      valid.forEach((file, idx) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          results[idx] = {
            base64: dataUrl.split(',')[1],
            mimeType: file.type,
            previewUrl: dataUrl,
            fileName: file.name,
          }
          if (results.filter(Boolean).length === valid.length) {
            onChange([...values, ...results])
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [values, onChange, maxImages]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles]
  )

  const removeImage = useCallback(
    (idx: number) => onChange(values.filter((_, i) => i !== idx)),
    [values, onChange]
  )

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {values.map((img, idx) => (
            <div key={idx} className="relative rounded-lg border border-gray-200 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.fileName}
                className="w-full h-28 object-contain bg-gray-50"
              />
              <div className="absolute top-1 right-1">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1 rounded-full bg-white/90 shadow hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label={`Elimină ${img.fileName}`}
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-500 truncate px-2 py-1 bg-gray-50 border-t border-gray-200">
                {img.fileName}
              </p>
            </div>
          ))}
        </div>
      )}

      {values.length < maxImages && (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-sm text-gray-500 transition-colors',
              'border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
            )}
          >
            <Plus size={16} />
            {values.length === 0 ? 'Adaugă imagini' : 'Adaugă încă o imagine'}
            <span className="text-xs text-gray-400">({values.length}/{maxImages})</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
