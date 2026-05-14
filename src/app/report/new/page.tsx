import { ReportForm } from '@/components/report-form/ReportForm'

export const metadata = {
  title: 'Raport nou — APASS Reports',
}

export default function NewReportPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raport accesibilitate nou</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Completează contextul, adaugă un screenshot, iar Claude va genera automat toate câmpurile necesare.
        </p>
      </div>
      <ReportForm />
    </div>
  )
}
