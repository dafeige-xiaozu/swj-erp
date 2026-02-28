import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200 resize-none',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error 
              ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' 
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
