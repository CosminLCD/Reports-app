'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
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
