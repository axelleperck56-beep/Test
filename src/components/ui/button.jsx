import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm',
  outline: 'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50',
  ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  emerald: 'bg-emerald-950 text-white hover:bg-emerald-900 shadow-sm',
  'outline-white': 'border border-white/40 text-white hover:bg-white/10 backdrop-blur-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
  icon: 'h-9 w-9',
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
