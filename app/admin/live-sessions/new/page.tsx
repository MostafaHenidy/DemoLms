"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Video, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAdminUser, isInstructor } from "@/lib/admin-auth"

export default function NewLiveSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [courses, setCourses] = useState<{ id: number; titleAr: string }[]>([])
  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    scheduledAt: "",
    durationMinutes: "60",
    maxSeats: "50",
    provider: "zoom" as "zoom" | "google_meet",
    courseId: "none",
  })

  useEffect(() => {
    const user = getAdminUser()
    const url =
      isInstructor(user) && user?.id
        ? `/api/admin/courses?limit=200&instructorId=${user.id}`
        : "/api/admin/courses?limit=200"
    fetch(url)
      .then((r) => r.json())
      .then((data) => setCourses(data.courses ?? []))
      .catch(() => setCourses([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.scheduledAt) {
      setError("حدد تاريخ ووقت الجلسة.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: form.titleAr.trim(),
          titleEn: form.titleEn.trim(),
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          durationMinutes: parseInt(form.durationMinutes, 10) || 60,
          maxSeats: parseInt(form.maxSeats, 10) || 50,
          provider: form.provider,
          courseId: form.courseId && form.courseId !== "none" ? parseInt(form.courseId, 10) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل إنشاء الجلسة")
        return
      }
      router.push("/admin/live-sessions")
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/live-sessions" className="hover:text-foreground">
          الجلسات المباشرة
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="font-medium text-foreground">جدولة جلسة</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">جدولة جلسة مباشرة</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ShieldOff className="w-4 h-4" />
            الجلسة لا تُسجّل ولا تُشارك بأي شكل. يتم إنشاء الاجتماع عبر Zoom أو Google Meet.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleAr">العنوان (عربي)</Label>
                <Input
                  id="titleAr"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                  placeholder="عنوان الجلسة"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">العنوان (إنجليزي)</Label>
                <Input
                  id="titleEn"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                  placeholder="Session title"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">التاريخ والوقت</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">المدة (دقيقة)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={15}
                  max={480}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxSeats">عدد المقاعد</Label>
                <Input
                  id="maxSeats"
                  type="number"
                  min={1}
                  value={form.maxSeats}
                  onChange={(e) => setForm((f) => ({ ...f, maxSeats: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>المنصة</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => setForm((f) => ({ ...f, provider: v as "zoom" | "google_meet" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom Meetings</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Zoom: أضف ZOOM_API_KEY و ZOOM_API_SECRET في .env لإنشاء الجلسة تلقائياً.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الدورة (اختياري)</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="— بدون دورة —" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— بدون دورة —</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.titleAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="gap-2">
                <Video className="w-4 h-4" />
                {loading ? "جاري الإنشاء..." : "إنشاء الجلسة"}
              </Button>
              <Link href="/admin/live-sessions">
                <Button type="button" variant="outline">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
