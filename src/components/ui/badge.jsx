import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-stone-100 text-stone-700',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
