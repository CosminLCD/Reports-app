'use client'

import { useState, useEffect } from 'react'
import type { FieldOptions } from '@/app/api/airtable-meta/route'

export function useAirtableOptions() {
  const [options, setOptions] = useState<FieldOptions>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/airtable-meta')
      .then((r) => r.json())
      .then((data: { success: boolean; fieldOptions?: FieldOptions; error?: string }) => {
        if (data.success && data.fieldOptions) {
          setOptions(data.fieldOptions)
        } else {
          setError(data.error ?? 'Eroare necunoscută')
        }
      })
      .catch(() => setError('Nu s-au putut încărca opțiunile Airtable'))
      .finally(() => setLoading(false))
  }, [])

  return { options, loading, error }
}
