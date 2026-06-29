import type { Platform, ConversationStatus } from '~/types'

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(new Date(date))
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function platformLabel(platform: Platform): string {
  const map: Record<Platform, string> = {
    facebook: 'Facebook',
    telegram: 'Telegram',
    instagram: 'Instagram',
    whatsapp: 'WhatsApp',
    web: 'Web',
  }
  return map[platform] ?? platform
}

export function platformColor(platform: Platform): string {
  const map: Record<Platform, string> = {
    facebook: 'bg-blue-600',
    telegram: 'bg-sky-500',
    instagram: 'bg-pink-600',
    whatsapp: 'bg-green-500',
    web: 'bg-slate-500',
  }
  return map[platform] ?? 'bg-gray-400'
}

export function statusBadge(status: ConversationStatus): string {
  const map: Record<ConversationStatus, string> = {
    open: 'badge bg-green-100 text-green-700',
    pending: 'badge bg-yellow-100 text-yellow-700',
    resolved: 'badge bg-blue-100 text-blue-700',
    closed: 'badge bg-gray-100 text-gray-600',
  }
  return map[status] ?? 'badge bg-gray-100 text-gray-600'
}

export function truncate(text: string, length = 60): string {
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export function initials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function wrapVar(v: string): string {
  return '{' + '{' + v + '}' + '}'
}
