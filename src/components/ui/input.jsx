import { cn } from '../../lib/utils'

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-stone-300 bg-white px-3 py-2',
        'text-sm text-stone-900 placeholder:text-stone-400',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
