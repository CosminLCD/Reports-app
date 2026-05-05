import { cn } from '@/lib/utils'

const priorityConfig: Record<string, { label: string; className: string }> = {
  Gold: { label: 'Gold', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  Silver: { label: 'Silver', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  Bronze: { label: 'Bronze', className: 'bg-orange-100 text-orange-800 border-orange-200' },
}

const complexityConfig: Record<string, { label: string; className: string }> = {
  Mare: { label: 'Complexitate Mare', className: 'bg-red-50 text-red-700 border-red-200' },
  Medie: { label: 'Complexitate Medie', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  Mica: { label: 'Complexitate Mică', className: 'bg-green-50 text-green-700 border-green-200' },
}

interface PriorityBadgeProps {
  priority: string
  className?: string
}

interface ComplexityBadgeProps {
  complexity: string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority] ?? { label: priority, className: 'bg-gray-100 text-gray-800 border-gray-200' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', config.className, className)}>
      {config.label}
    </span>
  )
}

export function ComplexityBadge({ complexity, className }: ComplexityBadgeProps) {
  const config = complexityConfig[complexity] ?? { label: complexity, className: 'bg-gray-100 text-gray-800 border-gray-200' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', config.className, className)}>
      {config.label}
    </span>
  )
}
