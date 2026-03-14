"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useStore } from "@/lib/store"
import {
  FileText,
  Video,
  Upload,
  Trash2,
  File,
  ClipboardList,
  BookOpen,
  Database,
  ImageIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [databankOpen, setDatabankOpen] = useState(false)
  const [databankType, setDatabankType] = useState<"pdf" | "word" | "image" | "video">("pdf")
  const [databankFiles, setDatabankFiles] = useState<{ url: string; name: string; type: string }[]>([])
  const [databankLoading, setDatabankLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const pdfRef = useRef<HTMLInputElement>(null)
  const wordRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File, type: "pdf" | "word" | "video" | "image") => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    const res = await fetch("/api/upload/lesson", { method: "POST", body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data
  }

  useEffect(() => {
    if (!databankOpen) return
    setDatabankLoading(true)
    fetch(`/api/admin/databank/files?type=${databankType}`)
      .then((r) => r.json())
      .then((data) => setDatabankFiles(data.files ?? []))
      .catch(() => setDatabankFiles([]))
      .finally(() => setDatabankLoading(false))
  }, [databankOpen, databankType])

  const openDatabank = (type: "pdf" | "word" | "image" | "video") => {
    setDatabankType(type)
    setDatabankOpen(true)
  }

  const addFromDatabank = async (file: { url: string; name: string; type: string }) => {
    try {
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}/attachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: file.type,
            path: file.url,
            originalName: file.name,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error("Failed")
      setAttachments((a) => [...a, data.attachment])
      setDatabankOpen(false)
      showToast("تمت إضافة الملف")
    } catch {
      showToast("فشل إضافة الملف", "error")
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const { url } = await uploadFile(file, "image")
      const res = await fetch(
        `/api/admin/courses/${courseId}/curriculum/sections/${sectionId}/lessons/${lesson.id}/attachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "image", path: url, originalName: file.name }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error("Failed")
      setAttachments((a) => [...a, data.attachment])
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل رفع الصورة", "error")
    } finally {
      setImageUploading(false)
      e.target.value = ""
    }
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
          محتوى الدروس: PDF، Word، صور، فيديو
        </Label>
        <p className="text-xs text-[#64748B]">من الجهاز أو من بنك البيانات</p>
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
          <Input
            ref={imageRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pdfRef.current?.click()}
          >
            <File className="h-4 w-4 me-1" />
            PDF (جهاز)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openDatabank("pdf")}
          >
            <Database className="h-4 w-4 me-1" />
            PDF (بنك البيانات)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => wordRef.current?.click()}
          >
            <File className="h-4 w-4 me-1" />
            Word (جهاز)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openDatabank("word")}
          >
            <Database className="h-4 w-4 me-1" />
            Word (بنك البيانات)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => imageRef.current?.click()}
            disabled={imageUploading}
          >
            <ImageIcon className="h-4 w-4 me-1" />
            {imageUploading ? "جاري الرفع..." : "صورة (جهاز)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openDatabank("image")}
          >
            <Database className="h-4 w-4 me-1" />
            صورة (بنك البيانات)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openDatabank("video")}
          >
            <Database className="h-4 w-4 me-1" />
            فيديو (بنك البيانات)
          </Button>
        </div>
        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-2 text-sm text-[#0F172A]"
              >
                {a.type === "image" ? (
                  <span className="relative inline-block h-6 w-6 shrink-0 overflow-hidden rounded bg-[#E2E8F0]">
                    <Image src={a.path} alt="" fill className="object-cover" sizes="24px" />
                  </span>
                ) : a.type === "video" ? (
                  <Video className="h-4 w-4 shrink-0 text-[#64748B]" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-[#64748B]" />
                )}
                <a
                  href={a.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2563EB] truncate min-w-0"
                >
                  {a.originalName}
                </a>
                <span className="text-xs text-[#94A3B8]">({a.type})</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-red-500"
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
          اختبار من صفحة الاختبارات
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
              إنشاء اختبار من صفحة الاختبارات
            </a>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          واجب من صفحة الواجبات
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
              إنشاء واجب من صفحة الواجبات
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

      <Dialog open={databankOpen} onOpenChange={setDatabankOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle>اختيار من بنك البيانات — {databankType === "pdf" ? "PDF" : databankType === "word" ? "Word" : databankType === "image" ? "صور" : "فيديو"}</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {databankLoading ? (
              <p className="py-8 text-center text-[#64748B]">جاري التحميل...</p>
            ) : databankFiles.length === 0 ? (
              <p className="py-8 text-center text-[#64748B]">
                لا توجد ملفات من هذا النوع في بنك البيانات. ارفع من الجهاز أولاً.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {databankFiles.map((file) => (
                  <button
                    type="button"
                    key={`${file.url}-${file.name}`}
                    onClick={() => addFromDatabank(file)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-center transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {file.type === "image" ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded bg-[#E2E8F0]">
                        <Image
                          src={file.url}
                          alt={file.name}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded bg-[#E2E8F0]">
                        {file.type === "video" ? (
                          <Video className="h-6 w-6 text-[#64748B]" />
                        ) : (
                          <FileText className="h-6 w-6 text-[#64748B]" />
                        )}
                      </div>
                    )}
                    <span className="truncate w-full text-xs text-[#475569]">{file.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
