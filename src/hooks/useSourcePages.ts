'use client'

import { useState, useEffect } from 'react'
import type { SourcePage } from '@/app/api/airtable-source/route'

export function useSourcePages() {
  const [pages, setPages] = useState<SourcePage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/airtable-source')
      .then((r) => r.json())
      .then((data: { success: boolean; pages?: SourcePage[]; error?: string }) => {
        if (data.success && data.pages) {
          setPages(data.pages)
        } else {
          setError(data.error ?? 'Eroare necunoscută')
        }
      })
      .catch(() => setError('Nu s-au putut încărca paginile'))
      .finally(() => setLoading(false))
  }, [])

  return { pages, loading, error }
}
