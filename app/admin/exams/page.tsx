"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileQuestion, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { useStore } from "@/lib/store"

interface ExamItem {
  id: number
  titleAr: string
  titleEn: string
  courseId: number | null
  _count?: { questions: number }
}

export default function AdminExamsPage() {
  const { showToast } = useStore()
  const [exams, setExams] = useState<ExamItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setExams(data.exams ?? [])
      })
      .catch(() => showToast("فشل تحميل الاختبارات", "error"))
      .finally(() => setLoading(false))
  }, [showToast])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`حذف الاختبار "${title}"؟`)) return
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      setExams((e) => e.filter((x) => x.id !== id))
      showToast("تم الحذف", "success")
    } catch {
      showToast("فشل الحذف", "error")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">الاختبارات</h2>
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">الاختبارات</h2>
        <Link href="/admin/exams/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة اختبار
          </Button>
        </Link>
      </div>

      {exams.length === 0 ? (
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <EmptyState
              icon="file-question"
              title="لا توجد اختبارات"
              description="أضف اختباراً جديداً للبدء."
              action={{
                label: "إضافة اختبار",
                onClick: () => (window.location.href = "/admin/exams/new"),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <ul className="divide-y divide-border">
              {exams.map((exam) => (
                <li
                  key={exam.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <FileQuestion className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exam.titleAr}</p>
                      <p className="text-sm text-muted-foreground">
                        {exam._count?.questions ?? 0} سؤال
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/exams/${exam.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(exam.id, exam.titleAr)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
