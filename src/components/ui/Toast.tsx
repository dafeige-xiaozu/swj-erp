import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null

export function toast(type: ToastType, message: string) {
  if (addToastFn) {
    addToastFn(type, message)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    addToastFn = (type: ToastType, message: string) => {
      const id = Math.random().toString(36).substring(2)
      setToasts((prev) => [...prev, { id, type, message }])
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }

    return () => {
      addToastFn = null
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up min-w-[300px] max-w-md',
              {
                'bg-success-50 text-success-800 border border-success-200': t.type === 'success',
                'bg-danger-50 text-danger-800 border border-danger-200': t.type === 'error',
                'bg-primary-50 text-primary-800 border border-primary-200': t.type === 'info',
                'bg-warning-50 text-warning-800 border border-warning-200': t.type === 'warning',
              }
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded hover:bg-black/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
