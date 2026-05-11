'use client'

import { useState, useEffect } from 'react'
import type { FieldOptions, FieldNames } from '@/app/api/airtable-meta/route'

const DEFAULT_FIELD_NAMES: FieldNames = {
  client: 'Client',
  pageName: 'Page Name',
  pageLink: 'Page Link',
  appName: 'App/Website Name',
  device: 'Device',
  os: 'Operating System',
  browser: 'Browser',
  problem: 'Problem',
  shortDesc: 'Short Description',
  solution: 'Solution',
  techSolution: 'Technical Solution',
  wcag: 'WCAG',
  wcagLevel: 'WCAG Level',
  wcagCategory: 'WCAG Category',
  disability: 'Disability',
  team: 'Team of Interest',
  prioritization: 'Prioritization',
  complexity: 'Level of complexity',
}

export function useAirtableOptions() {
  const [options, setOptions] = useState<FieldOptions>({})
  const [fieldNames, setFieldNames] = useState<FieldNames>(DEFAULT_FIELD_NAMES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/airtable-meta')
      .then((r) => r.json())
      .then((data: { success: boolean; fieldOptions?: FieldOptions; fieldNames?: FieldNames; error?: string }) => {
        if (data.success && data.fieldOptions) {
          setOptions(data.fieldOptions)
          if (data.fieldNames) setFieldNames(data.fieldNames)
        } else {
          setError(data.error ?? 'Eroare necunoscută')
        }
      })
      .catch(() => setError('Nu s-au putut încărca opțiunile Airtable'))
      .finally(() => setLoading(false))
  }, [])

  return { options, fieldNames, loading, error }
}
