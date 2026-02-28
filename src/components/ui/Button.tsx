import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Variants
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400': variant === 'secondary',
            'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400': variant === 'ghost',
            'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500': variant === 'danger',
            'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500': variant === 'success',
            // Sizes
            'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
            'px-4 py-2 text-sm gap-2': size === 'md',
            'px-6 py-3 text-base gap-2': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
