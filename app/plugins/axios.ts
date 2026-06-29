import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmpassword',
  'accesstoken',
  'refreshtoken',
  'bottoken',
  'token',
  'secret',
  'secrettoken',
  'verifytoken',
  'authorization',
])

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.has(k.toLowerCase()) ? '***' : v,
    ])
  )
}

function truncate(str: string, max = 200): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function formatBody(data: unknown): string | null {
  if (!data) return null
  try {
    const s = typeof data === 'string' ? data : JSON.stringify(sanitize(data))
    return truncate(s)
  } catch {
    return null
  }
}

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _startTime?: number
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = axios.create({
    baseURL: `${config.public.baseUrl}/api`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  })

  // ─── Auth ──────────────────────────────────────────────────────────────────
  api.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const token = authStore.accessToken
    if (token) req.headers.Authorization = `Bearer ${token}`
    req._startTime = Date.now()
    return req
  })

  // ─── Request log ──────────────────────────────────────────────────────────
  api.interceptors.request.use((req: InternalAxiosRequestConfig) => {
    const method = req.method?.toUpperCase() ?? 'REQ'
    const url = req.url ?? ''
    const parts: string[] = [`[API] ${method} ${url}`]

    if (req.params && Object.keys(req.params).length) {
      parts.push(`  params: ${JSON.stringify(req.params)}`)
    }
    const body = formatBody(req.data)
    if (body) parts.push(`  body: ${body}`)

    console.groupCollapsed(parts[0])
    parts.slice(1).forEach((p) => console.log(p))
    console.groupEnd()

    return req
  })

  // ─── Response log ─────────────────────────────────────────────────────────
  api.interceptors.response.use(
    (res: AxiosResponse) => {
      const ms = Date.now() - (res.config._startTime ?? Date.now())
      const method = res.config.method?.toUpperCase() ?? ''
      const url = res.config.url ?? ''
      const status = res.status

      const color =
        status < 300 ? 'color:#22c55e' : status < 400 ? 'color:#f59e0b' : 'color:#ef4444'
      console.groupCollapsed(`%c[API] ${method} ${url} → ${status} +${ms}ms`, color)
      const data = res.data?.data ?? res.data
      if (data !== undefined && data !== null) {
        const preview = truncate(JSON.stringify(data))
        console.log('response:', preview)
      }
      console.groupEnd()

      return res
    },
    async (error) => {
      const cfg = error.config ?? {}
      const ms = Date.now() - (cfg._startTime ?? Date.now())
      const method = cfg.method?.toUpperCase() ?? ''
      const url = cfg.url ?? ''
      const status = error.response?.status ?? 'ERR'
      const message = error.response?.data?.message ?? error.message ?? 'Request failed'

      console.groupCollapsed(`%c[API] ${method} ${url} → ${status} +${ms}ms`, 'color:#ef4444')
      console.error('error:', Array.isArray(message) ? message.join(', ') : message)
      if (error.response?.data) console.log('detail:', error.response.data)
      console.groupEnd()

      // ─── 401 retry ───────────────────────────────────────────────────────
      const original = error.config
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        try {
          await authStore.refresh()
          original.headers.Authorization = `Bearer ${authStore.accessToken}`
          return api(original)
        } catch {
          authStore.logout()
          navigateTo('/login')
        }
      }
      return Promise.reject(error)
    }
  )

  return { provide: { api } }
})
