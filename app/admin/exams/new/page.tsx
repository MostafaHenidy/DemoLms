"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function NewExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleAr.trim() || !titleEn.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAr: titleAr.trim(), titleEn: titleEn.trim() }),
      })
      if (!res.ok) throw new Error("Failed")
      const data = await res.json()
      router.push(`/admin/exams/${data.exam.id}/edit`)
    } catch {
      alert("فشل إنشاء الاختبار")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/exams"
          className="text-muted-foreground hover:text-foreground"
        >
          الاختبارات
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">إضافة اختبار</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">إضافة اختبار جديد</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الاختبار (عربي)</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="مثال: اختبار الوحدة الأولى"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>عنوان الاختبار (إنجليزي)</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Unit 1 Quiz"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
              <Link href="/admin/exams">
                <Button type="button" variant="outline">إلغاء</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
