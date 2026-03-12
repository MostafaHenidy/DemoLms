"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FileText, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { useStore } from "@/lib/store"

interface HomeworkItem {
  id: number
  titleAr: string
  titleEn: string
  courseId: number | null
  _count?: { questions: number }
}

export default function AdminHomeworkPage() {
  const { showToast } = useStore()
  const [homework, setHomework] = useState<HomeworkItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/homework")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.details || data.error)
        setHomework(data.homework ?? [])
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "فشل تحميل الواجبات", "error")
      })
      .finally(() => setLoading(false))
  }, [showToast])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`حذف الواجب "${title}"؟`)) return
    try {
      const res = await fetch(`/api/admin/homework/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      setHomework((h) => h.filter((x) => x.id !== id))
      showToast("تم الحذف", "success")
    } catch {
      showToast("فشل الحذف", "error")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">الواجبات</h2>
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
        <h2 className="text-xl font-bold text-foreground">الواجبات</h2>
        <Link href="/admin/homework/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة واجب
          </Button>
        </Link>
      </div>

      {homework.length === 0 ? (
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <EmptyState
              icon="file-text"
              title="لا توجد واجبات"
              description="أضف واجباً جديداً للبدء."
              action={{
                label: "إضافة واجب",
                onClick: () => (window.location.href = "/admin/homework/new"),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <ul className="divide-y divide-border">
              {homework.map((hw) => (
                <li
                  key={hw.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{hw.titleAr}</p>
                      <p className="text-sm text-muted-foreground">
                        {hw._count?.questions ?? 0} سؤال
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/homework/${hw.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(hw.id, hw.titleAr)}
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
