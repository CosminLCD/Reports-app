'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CustomField } from '@/types'

const STORAGE_KEY = 'apass_custom_fields'

export function useCustomFields() {
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setCustomFields(JSON.parse(stored) as CustomField[])
      }
    } catch {
      // localStorage unavailable
    }
    setLoaded(true)
  }, [])

  const save = useCallback((fields: CustomField[]) => {
    setCustomFields(fields)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
    } catch {
      // localStorage unavailable
    }
  }, [])

  const addField = useCallback(
    (field: Omit<CustomField, 'id'>) => {
      const newField: CustomField = {
        ...field,
        id: `custom_${Date.now()}`,
      }
      save([...customFields, newField])
      return newField
    },
    [customFields, save]
  )

  const updateField = useCallback(
    (id: string, updates: Partial<CustomField>) => {
      save(customFields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
    },
    [customFields, save]
  )

  const removeField = useCallback(
    (id: string) => {
      save(customFields.filter((f) => f.id !== id))
    },
    [customFields, save]
  )

  return { customFields, loaded, addField, updateField, removeField, save }
}
