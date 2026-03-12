"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"

export default function NewHomeworkPage() {
  const router = useRouter()
  const { showToast } = useStore()
  const [loading, setLoading] = useState(false)
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleAr.trim() || !titleEn.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAr: titleAr.trim(), titleEn: titleEn.trim() }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      router.push(`/admin/homework/${data.homework.id}/edit`)
    } catch {
      showToast("فشل إنشاء الواجب", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/homework"
          className="text-muted-foreground hover:text-foreground"
        >
          الواجبات
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">إضافة واجب</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">إضافة واجب جديد</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الواجب (عربي)</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: واجب الوحدة الأولى"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان الواجب (إنجليزي)</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Unit 1 Homework"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
              <Link href="/admin/homework">
                <Button type="button" variant="outline">إلغاء</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
