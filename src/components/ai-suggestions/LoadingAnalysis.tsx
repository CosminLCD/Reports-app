import { Bot } from 'lucide-react'

export function LoadingAnalysis() {
  const fields = [
    'Analiză problemă...',
    'Identificare criteriu WCAG...',
    'Generare soluție tehnică...',
    'Generare soluție non-tehnică...',
    'Evaluare prioritate și complexitate...',
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot size={32} className="text-blue-500" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Claude analizează problema</h3>
        <p className="text-sm text-gray-500">Aceasta poate dura 10–20 secunde</p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {fields.map((label, i) => (
          <div
            key={label}
            className="flex items-center gap-2 text-sm text-gray-500"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            <span className="animate-pulse">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
