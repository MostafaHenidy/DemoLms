"use client"

import { useState, useEffect, useCallback } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, UserPlus } from "lucide-react"
import { useChatSocket } from "@/lib/use-chat-socket"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

type Recipient = { type: "admin" | "teacher"; id: number; name: string; email: string }

type Conversation = {
  id: number
  counterpartType: string
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

export default function DashboardChatPage() {
  const { user } = useStore()
  const userId = user ? Number(user.id) : null

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const onNewMessage = useCallback((msg: unknown) => {
    const m = msg as Message
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
  }, [])

  useChatSocket(selectedId, onNewMessage)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/chat/recipients?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setRecipients(data.recipients ?? []))
      .catch(() => setRecipients([]))
  }, [userId])

  useEffect(() => {
    if (!userId) return
    fetch(`/api/chat/conversations?userId=${userId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations ?? [])
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [userId])

  useEffect(() => {
    if (selectedId == null || !userId) {
      setMessages([])
      setMessagesLoading(false)
      return
    }
    setMessagesLoading(true)
    fetch(`/api/chat/conversations/${selectedId}/messages?userId=${userId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false))
  }, [selectedId, userId])

  // Poll for new messages when socket isn't available (fallback for real-time)
  useEffect(() => {
    if (selectedId == null || !userId) return
    const interval = setInterval(() => {
      fetch(`/api/chat/conversations/${selectedId}/messages?userId=${userId}`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setMessages(data.messages ?? []))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedId, userId])

  const selected = conversations.find((c) => c.id === selectedId)
  const counterpartName =
    selected?.counterpartAdmin?.name ?? selected?.counterpartUser?.name ?? "—"

  const startConversation = async (recipient: Recipient) => {
    if (!userId) return
    setLoading(true)
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          counterpartType: recipient.type,
          ...(recipient.type === "admin" ? { counterpartAdminId: recipient.id } : { counterpartUserId: recipient.id }),
        }),
      })
      const data = await res.json()
      if (res.ok && data.conversation) {
        const conv = data.conversation as { id: number }
        setConversations((prev) => {
          if (prev.some((c) => c.id === conv.id)) return prev
          return [{
            id: conv.id,
            counterpartType: recipient.type,
            counterpartAdmin: recipient.type === "admin" ? { id: recipient.id, name: recipient.name } : undefined,
            counterpartUser: recipient.type === "teacher" ? { id: recipient.id, name: recipient.name } : undefined,
            lastMessage: null,
            updatedAt: new Date().toISOString(),
          }, ...prev]
        })
        setSelectedId(conv.id)
        setShowNewChat(false)
      }
    } finally {
      setLoading(false)
    }
  }

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
        body: JSON.stringify({ body: text, userId: Number(userId) }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } finally {
      setSending(false)
    }
  }

  if (!userId) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#0F172A]">المحادثات</h2>
        <Card>
          <CardContent className="py-12 text-center text-[#94A3B8]">
            يرجى تسجيل الدخول لاستخدام المحادثات.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0F172A]">المحادثات</h2>
        <Button onClick={() => setShowNewChat(true)} size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          محادثة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-12rem)] min-h-[400px]">
            <div className="w-80 border-l border-[#E2E8F0] flex flex-col">
              {showNewChat ? (
                <div className="p-4 border-b border-[#E2E8F0]">
                  <p className="text-sm font-semibold text-[#0F172A] mb-2">اختر مرسل إليه</p>
                  <p className="text-xs text-[#94A3B8] mb-3">يمكنك المراسلة مع الإداريين أو مدربي الدورات المسجّل فيها.</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {recipients.map((r) => (
                      <button
                        key={`${r.type}-${r.id}`}
                        type="button"
                        onClick={() => startConversation(r)}
                        disabled={loading}
                        className="w-full text-right px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-sm"
                      >
                        <span className="font-medium text-[#0F172A]">{r.name}</span>
                        <span className="text-xs text-[#94A3B8] block">{r.type === "admin" ? "إداري" : "مدرب"}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setShowNewChat(false)}>
                    إلغاء
                  </Button>
                </div>
              ) : null}
              {loading && !showNewChat ? (
                <div className="p-4 text-sm text-[#94A3B8]">جاري التحميل...</div>
              ) : conversations.length === 0 && !showNewChat ? (
                <div className="p-4 text-sm text-[#94A3B8]">لا توجد محادثات. ابدأ محادثة جديدة مع إداري أو مدرب.</div>
              ) : !showNewChat ? (
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-right px-4 py-3 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] ${selectedId === c.id ? "bg-[#2563EB]/10" : ""}`}
                    >
                      <p className="font-semibold text-[#0F172A]">{c.counterpartAdmin?.name ?? c.counterpartUser?.name ?? "—"}</p>
                      <p className="text-xs text-[#94A3B8] truncate">{c.lastMessage?.body ?? "—"}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              {selectedId == null && !showNewChat ? (
                <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>اختر محادثة أو ابدأ محادثة جديدة.</p>
                  </div>
                </div>
              ) : selectedId != null ? (
                <>
                  <div className="px-4 py-3 border-b border-[#E2E8F0] font-semibold text-[#0F172A]">
                    {counterpartName}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8 text-sm text-[#94A3B8]">جاري تحميل الرسائل...</div>
                    ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.senderType === "student" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            m.senderType === "student"
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#F1F5F9] text-[#0F172A]"
                          }`}
                        >
                          <p className="text-sm">{m.body}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(m.createdAt), "HH:mm", { locale: ar })}
                          </p>
                        </div>
                      </div>
                    )))}
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
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
