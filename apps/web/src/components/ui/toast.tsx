import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@ltoc/ui'

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastProps {
  title: string
  description?: string
  action?: ToastAction
  duration?: number
}

interface ToastItem extends ToastProps {
  id: string
}

const toastState = {
  toasts: [] as ToastItem[],
  addToast: (toast: ToastProps) => {},
  removeToast: (id: string) => {}
}

export function toast(props: ToastProps) {
  const id = Math.random().toString(36).substr(2, 9)
  toastState.addToast({ ...props, id })
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  toastState.addToast = (toast: ToastItem) => {
    setToasts(prev => [...prev, toast])
  }

  toastState.removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => toastState.removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  )
}

function Toast({ title, description, action, duration = 5000, onClose }: ToastProps & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300">
      <div className="relative overflow-hidden rounded-lg border bg-background p-4 pr-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-1 top-1 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="grid gap-1">
          <div className="text-sm font-semibold">{title}</div>
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
          {action && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                action.onClick()
                onClose()
              }}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}