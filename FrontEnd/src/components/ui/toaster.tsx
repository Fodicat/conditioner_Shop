
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="animate-fade-in bg-background text-foreground border-border dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-foreground dark:text-gray-100">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-muted-foreground dark:text-gray-300">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
