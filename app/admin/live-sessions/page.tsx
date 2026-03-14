"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Video, Calendar, Users, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  meetingUrl: string | null
  course: { id: number; titleAr: string } | null
  createdBy: { id: number; name: string } | null
  bookingsCount: number
  noRecording: boolean
}

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/live-sessions")
      .then((r) => r.json())
      .then((data) => {
        if (data.sessions) setSessions(data.sessions)
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = sessions.filter((s) => new Date(s.scheduledAt) >= now)
  const past = sessions.filter((s) => new Date(s.scheduledAt) < now)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-xl font-bold text-foreground">الجلسات المباشرة</h2>
        <Link href="/admin/live-sessions/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            جدولة جلسة
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        حدد وقت وتاريخ الجلسة. يتم إنشاء الرابط عبر Zoom أو Google Meet. الجلسة لا تُسجّل ولا تُشارك.
      </p>

      {loading ? (
        <p className="text-muted-foreground py-8">جاري التحميل...</p>
      ) : sessions.length === 0 ? (
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">لا توجد جلسات</p>
              <p className="text-sm mt-1">جدول جلسة مباشرة جديدة (Zoom أو Google Meet).</p>
              <Link href="/admin/live-sessions/new" className="inline-block mt-4">
                <Button>جدولة جلسة</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>التاريخ والوقت</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>المقاعد</TableHead>
                      <TableHead>المنصة</TableHead>
                      <TableHead className="text-start">رابط الانضمام</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{s.titleAr}</div>
                          {s.course && (
                            <div className="text-xs text-muted-foreground">{s.course.titleAr}</div>
                          )}
                          {s.noRecording && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                              <ShieldOff className="w-3 h-3" />
                              لا تسجيل ولا مشاركة
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(s.scheduledAt), "dd MMM yyyy, HH:mm", { locale: ar })}
                        </TableCell>
                        <TableCell>{s.durationMinutes} د</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{s.bookingsCount}</span>
                          <span className="text-muted-foreground"> / {s.maxSeats}</span>
                        </TableCell>
                        <TableCell>{s.provider === "zoom" ? "Zoom" : "Google Meet"}</TableCell>
                        <TableCell className="text-start">
                          {s.meetingUrl && (
                            <a
                              href={s.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              انضم
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">الجلسات المنتهية</h3>
              <Table>
                <TableBody>
                  {past.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.titleAr}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(s.scheduledAt), "dd MMM yyyy, HH:mm", { locale: ar })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
