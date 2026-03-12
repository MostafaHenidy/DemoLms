"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import {
  GripVertical,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckSquare,
  Type,
  File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type QuestionType = "mcq" | "true_false" | "text" | "file"

export interface QuestionData {
  id?: number
  type: QuestionType
  questionTextAr: string
  questionTextEn: string
  options?: string[]
  correctAnswer?: string | null
  points: number
  order: number
}

interface QuestionEditorProps {
  question: QuestionData
  mode: "exam" | "homework"
  entityId: number
  onSaved: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  canMoveUp?: boolean
  canMoveDown?: boolean
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: "mcq", label: "اختيار من متعدد", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "true_false", label: "صح أو خطأ", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "text", label: "نص", icon: <Type className="h-4 w-4" /> },
  { value: "file", label: "ملف (PDF أو Word)", icon: <File className="h-4 w-4" /> },
]

export function QuestionEditor({
  question,
  mode,
  entityId,
  onSaved,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: QuestionEditorProps) {
  const { showToast } = useStore()
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState<QuestionType>(question.type)
  const [questionTextAr, setQuestionTextAr] = useState(question.questionTextAr)
  const [questionTextEn, setQuestionTextEn] = useState(question.questionTextEn)
  const parseOptions = (): string[] => {
    const o = question.options
    if (Array.isArray(o)) return o.length ? o : ["", ""]
    if (typeof o === "string") {
      try {
        const p = JSON.parse(o)
        return Array.isArray(p) && p.length ? p : ["", ""]
      } catch {
        return ["", ""]
      }
    }
    return ["", ""]
  }
  const [options, setOptions] = useState<string[]>(parseOptions())
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer ?? "")
  const [points, setPoints] = useState(question.points)

  const baseUrl = mode === "exam" ? `/api/admin/exams/${entityId}` : `/api/admin/homework/${entityId}`

  const addOption = () => setOptions((o) => [...o, ""])
  const removeOption = (i: number) => setOptions((o) => o.filter((_, idx) => idx !== i))
  const updateOption = (i: number, v: string) =>
    setOptions((o) => {
      const n = [...o]
      n[i] = v
      return n
    })

  const handleSave = async () => {
    if (!questionTextAr.trim() || !questionTextEn.trim()) {
      showToast("أدخل نص السؤال بالعربية والإنجليزية", "error")
      return
    }
    setSaving(true)
    try {
      const payload = {
        type,
        questionTextAr: questionTextAr.trim(),
        questionTextEn: questionTextEn.trim(),
        options: type === "mcq" ? options.filter((o) => o.trim()) : undefined,
        correctAnswer:
          type === "mcq"
            ? correctAnswer
            : type === "true_false"
              ? correctAnswer === "true" || correctAnswer === "false"
                ? correctAnswer
                : null
              : null,
        points,
      }

      if (question.id) {
        const res = await fetch(`${baseUrl}/questions/${question.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || "Failed")
      } else {
        const res = await fetch(`${baseUrl}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || "Failed")
      }
      showToast("تم الحفظ", "success")
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "فشل الحفظ"
      showToast(msg, "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!question.id || !onDelete) return
    if (!confirm("حذف هذا السؤال؟")) return
    try {
      const res = await fetch(`${baseUrl}/questions/${question.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      showToast("تم الحذف", "success")
      onDelete()
    } catch {
      showToast("فشل الحذف", "error")
    }
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-2 bg-muted/30 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          {onMoveUp && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
          {onMoveDown && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>
        <span className="flex-1 truncate font-medium">
          {questionTextAr || "(بدون عنوان)"} — {QUESTION_TYPES.find((t) => t.value === type)?.label}
        </span>
        {question.id && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground rotate-180" />
        )}
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>نوع السؤال</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        {t.icon}
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>النقاط</Label>
              <Input
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>نص السؤال (عربي)</Label>
            <Textarea
              value={questionTextAr}
              onChange={(e) => setQuestionTextAr(e.target.value)}
              placeholder="اكتب السؤال بالعربية"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>نص السؤال (إنجليزي)</Label>
            <Textarea
              value={questionTextEn}
              onChange={(e) => setQuestionTextEn(e.target.value)}
              placeholder="Write the question in English"
              rows={2}
            />
          </div>

          {type === "mcq" && (
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                الخيارات
                <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 me-1" />
                  إضافة
                </Button>
              </Label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`الخيار ${i + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeOption(i)}
                      disabled={options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mt-2">
                <Label>الإجابة الصحيحة (رقم الخيار 0-based)</Label>
                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الإجابة الصحيحة" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        الخيار {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "true_false" && (
            <div className="space-y-2">
              <Label>الإجابة الصحيحة</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">صح</SelectItem>
                  <SelectItem value="false">خطأ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {type === "text" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Type className="h-4 w-4" />
              الطالب يكتب إجابة نصية.
            </p>
          )}

          {type === "file" && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              الطالب يرفع ملف (PDF أو Word) كإجابة.
            </p>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
