import Link from 'next/link'
import { CheckCircle, ExternalLink, Plus, AlertTriangle } from 'lucide-react'

interface Props {
  searchParams: Promise<{ id?: string; imageError?: string }>
}

export const metadata = {
  title: 'Raport trimis — APASS Reports',
}

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const recordId = params.id
  const imageError = params.imageError

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <CheckCircle size={36} className="text-green-500" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Raport trimis cu succes!</h1>
      <p className="text-gray-500 mb-1 max-w-md">
        Datele au fost salvate în Airtable și sunt disponibile pentru prezentarea clientului.
      </p>
      {recordId && (
        <p className="text-xs text-gray-400 font-mono mb-2">ID înregistrare: {recordId}</p>
      )}
      {imageError && (
        <div className="flex items-start gap-2 mt-2 mb-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{imageError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Link
          href="/report/new"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} /> Raport nou
        </Link>
        <a
          href={`https://airtable.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ExternalLink size={16} /> Deschide Airtable
        </a>
      </div>
    </div>
  )
}
