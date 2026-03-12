"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Save, FileQuestion, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"

interface Answer {
  id: number
  questionId: number
  textAnswer: string | null
  filePath: string | null
  selectedAnswer: string | null
  score: number | null
  feedback: string | null
  examquestion: {
    id: number
    type: string
    questionTextAr: string
    questionTextEn: string
    points: number
  }
}

interface Submission {
  id: number
  examId: number
  userId: number
  status: string
  totalScore: number | null
  maxScore: number | null
  feedback: string | null
  submittedAt: string
  exam: { titleAr: string; titleEn: string }
  user: { id: number; name: string; email: string }
  answers: Answer[]
}

export default function ExamSubmissionReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { showToast } = useStore()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [totalScore, setTotalScore] = useState<number>(0)
  const [feedback, setFeedback] = useState("")
  const [answerScores, setAnswerScores] = useState<Record<number, number>>({})
  const [answerFeedbacks, setAnswerFeedbacks] = useState<Record<number, string>>({})

  useEffect(() => {
    fetch(`/api/admin/exam-submissions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        const s = data.submission as Submission
        setSubmission(s)
        setTotalScore(s.totalScore ?? 0)
        setFeedback(s.feedback ?? "")
        const scores: Record<number, number> = {}
        const feedbacks: Record<number, string> = {}
        s.answers.forEach((a) => {
          scores[a.id] = a.score ?? 0
          feedbacks[a.id] = a.feedback ?? ""
        })
        setAnswerScores(scores)
        setAnswerFeedbacks(feedbacks)
      })
      .catch(() => showToast("فشل تحميل الإجابة", "error"))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!submission) return
    setSaving(true)
    try {
      const answers = submission.answers.map((a) => ({
        id: a.id,
        score: answerScores[a.id] ?? 0,
        feedback: answerFeedbacks[a.id] ?? "",
      }))
      const res = await fetch(`/api/admin/exam-submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalScore,
          feedback,
          status: "graded",
          answers,
        }),
      })
      if (!res.ok) throw new Error("Failed")
      showToast("تم حفظ التصحيح", "success")
      router.refresh()
      setSubmission((prev) =>
        prev ? { ...prev, status: "graded", totalScore, feedback } : null
      )
    } catch {
      showToast("فشل الحفظ", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !submission) {
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
          href="/admin/exam-attempts"
          className="text-muted-foreground hover:text-foreground"
        >
          امتحانات الطلاب
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">
          {submission.exam.titleAr} — {submission.user.name}
        </span>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">معلومات الطالب</h2>
          <p className="text-sm text-muted-foreground">
            {submission.user.name} — {submission.user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            تاريخ التقديم: {new Date(submission.submittedAt).toLocaleString("ar-SA")}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">الإجابات</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {submission.answers.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border/50 p-4 space-y-3"
            >
              <p className="font-medium">{a.examquestion.questionTextAr}</p>
              <p className="text-sm text-muted-foreground">
                ({a.examquestion.type}) — {a.examquestion.points} نقطة
              </p>

              {a.examquestion.type === "file" && a.filePath ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الملف المرفوع:</p>
                  <a
                    href={a.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    تحميل الملف
                  </a>
                </div>
              ) : a.textAnswer ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الإجابة:</p>
                  <p className="bg-muted/50 rounded p-2 whitespace-pre-wrap">
                    {a.textAnswer}
                  </p>
                </div>
              ) : a.selectedAnswer !== null && a.selectedAnswer !== undefined ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الإجابة المختارة:</p>
                  <p className="bg-muted/50 rounded p-2">{a.selectedAnswer}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">لم يُجب الطالب</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>النقاط (0 - {a.examquestion.points})</Label>
                  <Input
                    type="number"
                    min={0}
                    max={a.examquestion.points}
                    value={answerScores[a.id] ?? 0}
                    onChange={(e) =>
                      setAnswerScores((prev) => ({
                        ...prev,
                        [a.id]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={answerFeedbacks[a.id] ?? ""}
                  onChange={(e) =>
                    setAnswerFeedbacks((prev) => ({
                      ...prev,
                      [a.id]: e.target.value,
                    }))
                  }
                  placeholder="ملاحظات للطالب..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label>الدرجة الإجمالية</Label>
            <Input
              type="number"
              min={0}
              value={totalScore}
              onChange={(e) => setTotalScore(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات عامة</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="ملاحظات للطالب..."
              rows={3}
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "جاري الحفظ..." : "حفظ التصحيح"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
