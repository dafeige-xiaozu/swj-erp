import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-gray-100 text-gray-700': variant === 'default',
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-success-100 text-success-700': variant === 'success',
          'bg-warning-100 text-warning-700': variant === 'warning',
          'bg-danger-100 text-danger-700': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
