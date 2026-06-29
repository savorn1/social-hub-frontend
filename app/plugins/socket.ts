import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  function connect(token: string): Socket {
    if (socket?.connected) return socket
    socket = io(`${config.public.baseUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    })
    return socket
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
  }

  function getSocket(): Socket | null {
    return socket
  }

  return { provide: { socket: { connect, disconnect, getSocket } } }
})
