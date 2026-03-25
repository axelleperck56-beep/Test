import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

export function Select({ className, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          'flex h-10 w-full appearance-none rounded-lg border border-stone-300 bg-white px-3 py-2 pr-10',
          'text-sm text-stone-900',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
        size={16}
      />
    </div>
  )
}
