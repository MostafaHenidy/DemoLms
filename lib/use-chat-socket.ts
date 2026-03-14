"use client"

import { useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "http://localhost:3001"

export function useChatSocket(conversationId: number | null, onNewMessage: (msg: unknown) => void) {
  const socketRef = useRef<Socket | null>(null)
  const onNewMessageRef = useRef(onNewMessage)
  const conversationIdRef = useRef<number | null>(null)
  onNewMessageRef.current = onNewMessage
  conversationIdRef.current = conversationId

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })
    socketRef.current = socket

    const handler = (msg: unknown) => {
      onNewMessageRef.current(msg)
    }
    socket.on("new_message", handler)

    const joinCurrentRoom = () => {
      const id = conversationIdRef.current
      if (id != null) socket.emit("join_conversation", { conversationId: id })
    }
    socket.on("connect", joinCurrentRoom)
    socket.on("connect_error", () => {
      // Socket server not running (e.g. npm run dev:chat not started). Chat still works without real-time.
    })

    return () => {
      socket.off("new_message", handler)
      socket.off("connect", joinCurrentRoom)
      socket.off("connect_error")
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    if (conversationId != null) {
      if (socket.connected) {
        socket.emit("join_conversation", { conversationId })
      }
      return () => {
        socket.emit("leave_conversation", { conversationId })
      }
    }
  }, [conversationId])

  return { socket: socketRef.current }
}
