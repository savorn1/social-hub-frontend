import type { BusinessHours } from '~/types'
import { useHttp } from '~/composables/useHttp'

export const useBusinessHoursService = () => {
  const http = useHttp()

  return {
    findAll: () => http.get<BusinessHours[]>('/business-hours'),
    update: (day: number, dto: Partial<BusinessHours>) =>
      http.patch<BusinessHours>(`/business-hours/${day}`, dto),
  }
}
