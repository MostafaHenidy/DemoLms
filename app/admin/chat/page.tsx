"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send } from "lucide-react"
import { useChatSocket } from "@/lib/use-chat-socket"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

type Conversation = {
  id: number
  student?: { id: number; name: string; email: string }
  counterpartAdmin?: { id: number; name: string }
  counterpartUser?: { id: number; name: string }
  lastMessage?: { body: string; createdAt: string } | null
  updatedAt: string
}

type Message = {
  id: number
  body: string
  senderType: string
  senderName: string | null
  createdAt: string
}

export default function AdminChatPage() {
  const searchParams = useSearchParams()
  const studentIdParam = searchParams.get("studentId")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const openedStudentIdRef = useRef<number | null>(null)
  const conversationFromUrlRef = useRef<Conversation | null>(null)

  const onNewMessage = useCallback((msg: unknown) => {
    const m = msg as Message
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
  }, [])

  useChatSocket(selectedId, onNewMessage)

  useEffect(() => {
    const listFromApi = (data: { conversations?: Conversation[] }) => {
      const list = data.conversations ?? []
      const fromUrl = conversationFromUrlRef.current
      if (fromUrl && !list.some((c) => c.id === fromUrl.id)) {
        return [fromUrl, ...list]
      }
      return list
    }
    fetch("/api/chat/conversations", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setConversations(listFromApi(data))
      })
      .catch(() => setConversations(conversationFromUrlRef.current ? [conversationFromUrlRef.current] : []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const studentId = studentIdParam ? parseInt(studentIdParam, 10) : NaN
    if (!studentId || isNaN(studentId)) return
    if (openedStudentIdRef.current === studentId) return
    openedStudentIdRef.current = studentId
    fetch(`/api/chat/conversations/with-student?studentId=${studentId}`, { credentials: "include" })
      .then((res) => res.json().then((data) => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) return
        const conv = data.conversation
        if (!conv?.id) return
        const conversation: Conversation = {
          id: conv.id,
          student: conv.student,
          lastMessage: conv.lastMessage ?? null,
          updatedAt: conv.updatedAt,
        }
        conversationFromUrlRef.current = conversation
        setConversations((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev
          return [conversation, ...prev]
        })
        setSelectedId(conv.id)
      })
      .catch(() => {})
  }, [studentIdParam])

  useEffect(() => {
    if (selectedId == null) {
      setMessages([])
      return
    }
    fetch(`/api/chat/conversations/${selectedId}/messages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
  }, [selectedId])

  // Poll for new messages when socket isn't available (fallback for real-time)
  useEffect(() => {
    if (selectedId == null) return
    const interval = setInterval(() => {
      fetch(`/api/chat/conversations/${selectedId}/messages`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setMessages(data.messages ?? []))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedId])

  const selected = conversations.find((c) => c.id === selectedId)
  const counterpartName = selected?.student?.name ?? "—"

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || selectedId == null || sending) return
    setSending(true)
    setInput("")
    try {
      const res = await fetch(`/api/chat/conversations/${selectedId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">المحادثات</h2>

      <Card>
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-12rem)] min-h-[400px]">
            <div className="w-80 border-l border-[#E2E8F0] flex flex-col">
              {loading ? (
                <div className="p-4 text-sm text-[#94A3B8]">جاري التحميل...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-[#94A3B8]">لا توجد محادثات بعد.</div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-right px-4 py-3 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] ${selectedId === c.id ? "bg-[#2563EB]/10" : ""}`}
                    >
                      <p className="font-semibold text-[#0F172A]">{c.student?.name ?? "طالب"}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{c.lastMessage?.body ?? "—"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              {selectedId == null ? (
                <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>اختر محادثة أو انتظر رسالة من طالب.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-[#E2E8F0] font-semibold text-[#0F172A]">
                    {counterpartName}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.senderType === "student" ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            m.senderType === "student"
                              ? "bg-[#F1F5F9] text-[#0F172A]"
                              : "bg-[#2563EB] text-white"
                          }`}
                        >
                          <p className="text-sm">{m.body}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(m.createdAt), "HH:mm", { locale: ar })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-[#E2E8F0] flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="اكتب رسالة..."
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={sending || !input.trim()} size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
