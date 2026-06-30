import { useToastStore } from '~/stores/toast.store'

export function useToast() {
  const store = useToastStore()
  return {
    success: (message: string) => store.add(message, 'success'),
    error: (message: string) => store.add(message, 'error'),
    info: (message: string) => store.add(message, 'info'),
    warning: (message: string) => store.add(message, 'warning'),
  }
}
