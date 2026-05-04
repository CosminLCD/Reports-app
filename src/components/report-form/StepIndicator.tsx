import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormStep } from '@/hooks/useReportForm'

const steps: { step: FormStep; label: string; description: string }[] = [
  { step: 1, label: 'Context', description: 'Client și dispozitiv' },
  { step: 2, label: 'Problemă', description: 'Screenshot și descriere' },
  { step: 3, label: 'Validare AI', description: 'Revizuire și trimitere' },
]

interface StepIndicatorProps {
  currentStep: FormStep
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progres formular" className="mb-8">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const isDone = currentStep > s.step
          const isCurrent = currentStep === s.step

          return (
            <li key={s.step} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
                    isDone && 'bg-green-500 border-green-500 text-white',
                    isCurrent && 'bg-blue-500 border-blue-500 text-white shadow-md',
                    !isDone && !isCurrent && 'bg-white border-gray-300 text-gray-400'
                  )}
                >
                  {isDone ? <Check size={16} /> : s.step}
                </div>
                <div className="mt-1.5 text-center hidden sm:block">
                  <p className={cn('text-xs font-semibold', isCurrent ? 'text-blue-600' : isDone ? 'text-green-600' : 'text-gray-400')}>
                    {s.label}
                  </p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </div>
              </div>

              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2 -mt-4 sm:-mt-8 transition-colors', isDone ? 'bg-green-400' : 'bg-gray-200')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
