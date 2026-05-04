import { cn } from '@/lib/utils'

interface WCAGBadgeProps {
  criterion: string
  className?: string
}

// Detectează nivelul din criteriu: 1.x = Perceivable, 2.x = Operable, 3.x = Understandable, 4.x = Robust
function getCriterionColor(criterion: string): string {
  const num = parseFloat(criterion)
  if (num >= 1 && num < 2) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (num >= 2 && num < 3) return 'bg-green-100 text-green-800 border-green-200'
  if (num >= 3 && num < 4) return 'bg-amber-100 text-amber-800 border-amber-200'
  if (num >= 4) return 'bg-purple-100 text-purple-800 border-purple-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

export function WCAGBadge({ criterion, className }: WCAGBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border',
        getCriterionColor(criterion),
        className
      )}
    >
      WCAG {criterion}
    </span>
  )
}
