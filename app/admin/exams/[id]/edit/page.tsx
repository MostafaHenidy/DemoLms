"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QuestionEditor, type QuestionData } from "@/components/admin/question-editor"
import { useStore } from "@/lib/store"

interface ExamQuestion {
  id: number
  type: string
  questionTextAr: string
  questionTextEn: string
  options: string | null
  correctAnswer: string | null
  points: number
  order: number
}

interface Exam {
  id: number
  titleAr: string
  titleEn: string
  courseId: number | null
  questions: ExamQuestion[]
}

export default function EditExamPage() {
  const params = useParams()
  const id = params.id as string
  const { showToast } = useStore()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [titleAr, setTitleAr] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [addingNew, setAddingNew] = useState(false)

  const loadExam = () => {
    fetch(`/api/admin/exams/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setExam(data.exam)
        setTitleAr(data.exam.titleAr)
        setTitleEn(data.exam.titleEn)
      })
      .catch(() => showToast("فشل تحميل الاختبار", "error"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadExam()
  }, [id])

  const handleSaveTitle = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAr, titleEn }),
      })
      if (!res.ok) throw new Error("Failed")
      showToast("تم الحفظ", "success")
      loadExam()
    } catch {
      showToast("فشل الحفظ", "error")
    } finally {
      setSaving(false)
    }
  }

  const toQuestionData = (q: ExamQuestion): QuestionData => ({
    id: q.id,
    type: q.type as QuestionData["type"],
    questionTextAr: q.questionTextAr,
    questionTextEn: q.questionTextEn,
    options: q.options ? (JSON.parse(q.options) as string[]) : undefined,
    correctAnswer: q.correctAnswer,
    points: q.points,
    order: q.order,
  })

  if (loading || !exam) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/exams"
          className="text-muted-foreground hover:text-foreground"
        >
          الاختبارات
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">تعديل الاختبار: {exam.titleAr}</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">معلومات الاختبار</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>العنوان (عربي)</Label>
              <Input
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان الاختبار"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان (إنجليزي)</Label>
              <Input
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Exam title"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveTitle} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">الأسئلة</h2>
          <Button
            size="sm"
            onClick={() => setAddingNew(true)}
            disabled={addingNew}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            إضافة سؤال
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {addingNew && (
            <div className="space-y-2">
              <QuestionEditor
                question={{
                  type: "mcq",
                  questionTextAr: "",
                  questionTextEn: "",
                  points: 1,
                  order: exam.questions.length,
                }}
                mode="exam"
                entityId={parseInt(id, 10)}
                onSaved={() => {
                  setAddingNew(false)
                  loadExam()
                }}
              />
              <Button size="sm" variant="outline" onClick={() => setAddingNew(false)}>
                إلغاء
              </Button>
            </div>
          )}
          {exam.questions.map((q, idx) => (
            <QuestionEditor
              key={q.id}
              question={toQuestionData(q)}
              mode="exam"
              entityId={parseInt(id, 10)}
              onSaved={loadExam}
              onDelete={loadExam}
              onMoveUp={idx > 0 ? () => {} : undefined}
              onMoveDown={idx < exam.questions.length - 1 ? () => {} : undefined}
              canMoveUp={idx > 0}
              canMoveDown={idx < exam.questions.length - 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
