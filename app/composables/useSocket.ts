import type { Socket } from 'socket.io-client'

export function useSocket() {
  const { $socket } = useNuxtApp()
  const authStore = useAuthStore()

  function connect(): Socket | null {
    if (!authStore.accessToken) return null
    return $socket.connect(authStore.accessToken)
  }

  function disconnect() {
    $socket.disconnect()
  }

  function getSocket(): Socket | null {
    return $socket.getSocket()
  }

  return { connect, disconnect, getSocket }
}
