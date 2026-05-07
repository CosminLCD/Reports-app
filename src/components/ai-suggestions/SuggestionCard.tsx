'use client'

import { useState } from 'react'
import { Check, Pencil, X, Bot, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AISuggestion } from '@/types'

interface SuggestionCardProps {
  label: string
  suggestion: AISuggestion<string>
  onAccept: () => void
  onEdit: (value: string) => void
  onReject: () => void
  multiline?: boolean
  selectOptions?: string[]
  hint?: string
  initialEditMode?: boolean
}

type State = 'pending' | 'accepted' | 'editing' | 'edited' | 'rejected'

function getState(s: AISuggestion<string>): State {
  if (s.rejected) return 'rejected'
  if (s.edited) return 'edited'
  if (s.accepted) return 'accepted'
  return 'pending'
}

const stateStyles: Record<State, string> = {
  pending: 'border-amber-300 bg-amber-50',
  accepted: 'border-green-300 bg-green-50',
  editing: 'border-blue-300 bg-blue-50',
  edited: 'border-blue-300 bg-blue-50',
  rejected: 'border-red-300 bg-red-50',
}

const stateIcons: Record<State, React.ReactNode> = {
  pending: <Bot size={14} className="text-amber-500" />,
  accepted: <Check size={14} className="text-green-600" />,
  editing: <Pencil size={14} className="text-blue-500" />,
  edited: <Pencil size={14} className="text-blue-500" />,
  rejected: <X size={14} className="text-red-500" />,
}

export function SuggestionCard({
  label,
  suggestion,
  onAccept,
  onEdit,
  onReject,
  multiline = false,
  selectOptions,
  hint,
  initialEditMode = false,
}: SuggestionCardProps) {
  const state = getState(suggestion)
  const [isEditing, setIsEditing] = useState(initialEditMode)
  const [editValue, setEditValue] = useState(suggestion.userValue ?? suggestion.value)
  const [expanded, setExpanded] = useState(false)

  const displayValue = suggestion.edited
    ? (suggestion.userValue ?? suggestion.value)
    : suggestion.value

  const isLong = displayValue.length > 200

  const handleSaveEdit = () => {
    onEdit(editValue)
    setIsEditing(false)
  }

  const handleStartEdit = () => {
    setEditValue(suggestion.userValue ?? suggestion.value)
    setIsEditing(true)
  }

  const handleAccept = () => {
    setIsEditing(false)
    onAccept()
  }

  const handleReject = () => {
    setIsEditing(false)
    onReject()
  }

  if (isEditing) {
    return (
      <div className={cn('rounded-lg border-2 p-3 transition-colors', 'border-blue-300 bg-blue-50')}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
          <span className="text-xs text-blue-500 italic">se salvează automat</span>
        </div>

        {selectOptions ? (
          <select
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value)
              onEdit(e.target.value)
              setIsEditing(false)
            }}
            autoFocus
            className="w-full rounded border border-blue-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {selectOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            rows={4}
            autoFocus
            className="w-full rounded border border-blue-300 bg-white px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit() }}
            autoFocus
            className="w-full rounded border border-blue-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

        {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border-2 p-3 transition-colors', stateStyles[state])}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {stateIcons[state]}
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{label}</span>
        </div>

        {/* Butoane acțiune */}
        {state !== 'rejected' && state === 'pending' && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
              title="Acceptă sugestia"
            >
              <Check size={11} /> Accept
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              title="Respinge sugestia"
            >
              <X size={11} /> Respinge
            </button>
          </div>
        )}

        {state === 'rejected' && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Pencil size={11} /> Completează manual
          </button>
        )}
      </div>

      {state === 'rejected' ? (
        <p className="text-sm text-red-600 italic">Câmp respins — va fi trimis gol în Airtable</p>
      ) : (
        <div
          onClick={handleStartEdit}
          className="cursor-text rounded -mx-1 px-1 py-0.5 hover:bg-white/50 transition-colors min-h-[2rem]"
          title="Click pentru a edita"
        >
          <p className={cn(
            'text-sm whitespace-pre-wrap',
            displayValue ? 'text-gray-800' : 'text-gray-400 italic',
            !expanded && isLong && 'line-clamp-3'
          )}>
            {displayValue || 'Click pentru a completa...'}
          </p>
          {isLong && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className="flex items-center gap-1 mt-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Restrânge' : 'Afișează tot'}
            </button>
          )}
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
