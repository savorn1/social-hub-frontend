import type { LoginPayload, RegisterPayload, AuthResponse } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useAuthService = () => {
  const http = useHttp()

  return {
    login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
    register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
    refresh: (refreshToken: string) =>
      http.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }),
    logout: () => http.delete('/auth/logout'),
  }
}
