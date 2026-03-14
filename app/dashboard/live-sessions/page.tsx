"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Video, Calendar, Users, ShieldOff, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface Session {
  id: number
  titleAr: string
  titleEn: string
  scheduledAt: string
  durationMinutes: number
  maxSeats: number
  provider: string
  course: { id: number; titleAr: string } | null
  bookedCount: number
  noRecording: boolean
}

interface SessionDetail extends Session {
  hasBooking: boolean
  meetingUrl: string | null
  meetingPassword: string | null
}

export default function DashboardLiveSessionsPage() {
  const { user } = useStore()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/live-sessions")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const fetchDetail = async (sessionId: number): Promise<SessionDetail | null> => {
    const uid = user?.id ? Number(user.id) : NaN
    if (!uid || isNaN(uid)) return null
    const res = await fetch(`/api/live-sessions/${sessionId}?userId=${uid}`)
    const data = await res.json()
    return data.session ?? null
  }

  const handleReserve = async (sessionId: number) => {
    const uid = user?.id ? Number(user.id) : NaN
    if (!uid || isNaN(uid)) return
    setReserving(sessionId)
    try {
      const res = await fetch(`/api/live-sessions/${sessionId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || "فشل حجز المقعد")
        return
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, bookedCount: s.bookedCount + 1 } : s
        )
      )
      const detail = await fetchDetail(sessionId)
      if (detail) setDetails((d) => ({ ...d, [sessionId]: detail }))
    } finally {
      setReserving(null)
    }
  }

  const handleCancelReserve = async (sessionId: number) => {
    const uid = user?.id ? Number(user.id) : NaN
    if (!uid || isNaN(uid)) return
    setReserving(sessionId)
    try {
      await fetch(`/api/live-sessions/${sessionId}/reserve`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      })
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s
        )
      )
      setDetails((d) => {
        const next = { ...d }
        delete next[sessionId]
        return next
      })
    } finally {
      setReserving(null)
    }
  }

  const [details, setDetails] = useState<Record<number, SessionDetail>>({})

  useEffect(() => {
    if (!user?.id || sessions.length === 0) return
    const uid = Number(user.id)
    if (isNaN(uid)) return
    sessions.forEach((s) => {
      fetch(`/api/live-sessions/${s.id}?userId=${uid}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.session) setDetails((d) => ({ ...d, [s.id]: data.session }))
        })
        .catch(() => {})
    })
  }, [user?.id, sessions])

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">يجب تسجيل الدخول لحجز مقعد في الجلسات المباشرة.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold">الجلسات المباشرة</h2>
      <p className="text-sm text-muted-foreground">
        احجز مقعدك في الجلسة. الرابط يظهر بعد الحجز. الجلسة لا تُسجّل ولا تُشارك.
      </p>

      {loading ? (
        <p className="text-muted-foreground">جاري التحميل...</p>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد جلسات قادمة حالياً.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => {
            const detail = details[s.id]
            const hasBooking = detail?.hasBooking ?? false
            const full = s.bookedCount >= s.maxSeats
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{s.titleAr}</h3>
                      {s.course && (
                        <p className="text-sm text-muted-foreground">{s.course.titleAr}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(s.scheduledAt), "dd MMM yyyy, HH:mm", { locale: ar })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {s.bookedCount} / {s.maxSeats}
                        </span>
                        {s.noRecording && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <ShieldOff className="w-4 h-4" />
                            لا تسجيل ولا مشاركة
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.provider === "zoom" ? "Zoom" : "Google Meet"} — {s.durationMinutes} دقيقة
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {hasBooking ? (
                        <>
                          {detail?.meetingUrl && (
                            <a
                              href={detail.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2"
                            >
                              <Button className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                انضم للجلسة
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reserving === s.id}
                            onClick={() => handleCancelReserve(s.id)}
                          >
                            {reserving === s.id ? "جاري..." : "إلغاء الحجز"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          disabled={full || reserving === s.id}
                          onClick={() => handleReserve(s.id)}
                        >
                          {reserving === s.id ? "جاري الحجز..." : full ? "لا توجد مقاعد" : "احجز مقعدي"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
