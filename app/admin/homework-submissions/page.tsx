"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, FileText, CheckCircle, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"

interface Homework {
  id: number
  titleAr: string
  titleEn: string
}

interface Submission {
  id: number
  homeworkId: number
  userId: number
  status: string
  totalScore: number | null
  maxScore: number | null
  submittedAt: string
  homework: { titleAr: string; titleEn: string }
  user: { id: number; name: string; email: string }
}

export default function HomeworkSubmissionsPage() {
  const { showToast } = useStore()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [homeworkList, setHomeworkList] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)
  const [filterHomework, setFilterHomework] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const loadData = () => {
    const params = new URLSearchParams()
    if (filterHomework !== "all") params.set("homeworkId", filterHomework)
    if (filterStatus !== "all") params.set("status", filterStatus)
    const qs = params.toString()
    Promise.all([
      fetch("/api/admin/homework").then((r) => r.json()),
      fetch(`/api/admin/homework-submissions${qs ? `?${qs}` : ""}`).then((r) => r.json()),
    ])
      .then(([hwRes, subRes]) => {
        setHomeworkList(hwRes.homework ?? [])
        setSubmissions(subRes.submissions ?? [])
      })
      .catch(() => showToast("فشل تحميل البيانات", "error"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [filterHomework, filterStatus])

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">إجابات الواجبات</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إجابات الواجبات</h2>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">الواجب:</span>
          <Select value={filterHomework} onValueChange={setFilterHomework}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {homeworkList.map((h) => (
                <SelectItem key={h.id} value={String(h.id)}>
                  {h.titleAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">الحالة:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="submitted">مُرسل</SelectItem>
              <SelectItem value="graded">مُصحح</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد إجابات حتى الآن.</p>
              <p className="text-sm mt-1">ستظهر هنا إجابات الطلاب عند تقديمها.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3 first:pt-0"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{s.homework.titleAr}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.user.name} — {s.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.submittedAt).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.status === "graded" ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        {s.totalScore ?? 0}/{s.maxScore ?? 0}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-amber-600">
                        <Clock className="h-4 w-4" />
                        بانتظار التصحيح
                      </span>
                    )}
                    <Link href={`/admin/homework-submissions/${s.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="h-4 w-4" />
                        مراجعة
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
