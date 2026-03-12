"use client"

import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import {
  FileText,
  Video,
  Upload,
  Trash2,
  File,
  ClipboardList,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Attachment {
  id: number
  type: string
  path: string
  originalName: string
}

interface Lesson {
  id: number
  titleAr: string
  titleEn: string
  duration: string | null
  videoUrl: string | null
  videoPath: string | null
  examId: number | null
  homeworkId: number | null
  attachments?: Attachment[]
}

interface LessonEditorProps {
  courseId: string
  sectionId: number
  lesson: Lesson
  exams: { id: number; titleAr: string; titleEn: string }[]
  homework: { id: number; titleAr: string; titleEn: string }[]
  onSaved: () => void
  onCancel: () => void
}

export function LessonEditor({
  courseId,
  sectionId,
  lesson,
  exams,
  homework,
  onSaved,
  onCancel,
}: LessonEditorProps) {
  const { showToast } = useStore()
  const [saving, setSaving] = useState(false)
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl || "")
  const [videoPath, setVideoPath] = useState(lesson.videoPath || "")
  const [videoUploading, setVideoUploading] = useState(false)
  const [examId, setExamId] = useState(lesson.examId ? String(lesson.examId) : "none")
  const [homeworkId, setHomeworkId] = useState(
    lesson.homeworkId ? String(lesson.homeworkId) : "none"
  )
  const [attachments, setAttachments] = useState<Attachment[]>(lesson.attachments || [])
  const pdfRef = useRef<HTMLInputElement>(null)
  const wordRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File, type: "pdf" | "word" | "video") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    const res = await fetch("/api/upload/lesson", { method: "POST", body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await uploadFile(file, "pdf")
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}/attachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "pdf", path: url, originalName: file.name }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error("Failed")
      setAttachments((a) => [...a, data.attachment])
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل رفع الملف", "error")
    }
    e.target.value = ""
  }

  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { url } = await uploadFile(file, "word")
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}/attachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "word", path: url, originalName: file.name }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error("Failed")
      setAttachments((a) => [...a, data.attachment])
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل رفع الملف", "error")
    }
    e.target.value = ""
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoUploading(true)
    try {
      const { url } = await uploadFile(file, "video")
      setVideoPath(url)
      setVideoUrl("")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل رفع الفيديو", "error")
    } finally {
      setVideoUploading(false)
      e.target.value = ""
    }
  }

  const handleRemoveAttachment = async (attId: number) => {
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}/attachments/${attId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed")
      setAttachments((a) => a.filter((x) => x.id !== attId))
    } catch {
      showToast("فشل الحذف", "error")
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: videoUrl.trim() || null,
            videoPath: videoPath || null,
            examId: examId === "none" ? null : parseInt(examId, 10),
            homeworkId: homeworkId === "none" ? null : parseInt(homeworkId, 10),
          }),
        }
      )
      if (!res.ok) throw new Error("Failed")
      onSaved()
    } catch {
      showToast("فشل الحفظ", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border-2 border-[#2563EB] bg-[#EFF6FF] p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            رابط الفيديو (YouTube, Vimeo...)
          </Label>
          <Input
            placeholder="https://..."
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value)
              if (e.target.value) setVideoPath("")
            }}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            أو رفع فيديو من الجهاز
          </Label>
          <div className="flex gap-2">
            <Input
              ref={videoRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => videoRef.current?.click()}
              disabled={videoUploading}
            >
              {videoUploading ? "جاري الرفع..." : "اختر ملف"}
            </Button>
            {videoPath && (
              <span className="text-sm text-[#64748B] truncate max-w-[120px]">
                ✓ مرفوع
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          ملفات PDF و Word
        </Label>
        <div className="flex flex-wrap gap-2">
          <Input
            ref={pdfRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
          <Input
            ref={wordRef}
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleWordUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pdfRef.current?.click()}
          >
            <File className="h-4 w-4 me-1" />
            PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => wordRef.current?.click()}
          >
            <File className="h-4 w-4 me-1" />
            Word
          </Button>
        </div>
        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 text-sm text-[#0F172A]"
              >
                <a
                  href={a.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2563EB] truncate"
                >
                  {a.originalName}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => handleRemoveAttachment(a.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          اختبار / كويز
        </Label>
        <Select value={examId} onValueChange={setExamId}>
          <SelectTrigger>
            <SelectValue placeholder="اختر اختبار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— بدون اختبار —</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.titleAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {exams.length === 0 && (
          <p className="text-xs text-[#64748B]">
            <a href="/admin/exams/new" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
              إنشاء اختبار جديد
            </a>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          الواجب
        </Label>
        <Select value={homeworkId} onValueChange={setHomeworkId}>
          <SelectTrigger>
            <SelectValue placeholder="اختر واجب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— بدون واجب —</SelectItem>
            {homework.map((h) => (
              <SelectItem key={h.id} value={String(h.id)}>
                {h.titleAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {homework.length === 0 && (
          <p className="text-xs text-[#64748B]">
            <a href="/admin/homework/new" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline">
              إنشاء واجب جديد
            </a>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          إلغاء
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </div>
    </div>
  )
}
