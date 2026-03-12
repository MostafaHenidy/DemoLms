"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight, Plus, GripVertical, Trash2, ChevronDown, Pencil } from "lucide-react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { LessonEditor } from "@/components/admin/lesson-editor"

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
  videoUrl?: string | null
  videoPath?: string | null
  examId?: number | null
  homeworkId?: number | null
  order: number
  attachments?: Attachment[]
}

interface Section {
  id: number
  titleAr: string
  titleEn: string
  order: number
  lessons: Lesson[]
}

export default function CurriculumPage() {
  const params = useParams()
  const { showToast } = useStore()
  const id = params?.id as string
  const [course, setCourse] = useState<{ titleAr: string } | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionTitleAr, setNewSectionTitleAr] = useState("")
  const [newSectionTitleEn, setNewSectionTitleEn] = useState("")
  const [addingLesson, setAddingLesson] = useState<number | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ sectionId: number; lesson: Lesson } | null>(null)
  const [exams, setExams] = useState<{ id: number; titleAr: string; titleEn: string }[]>([])
  const [homework, setHomework] = useState<
    { id: number; titleAr: string; titleEn: string }[]
  >([])
  const [newLessonTitleAr, setNewLessonTitleAr] = useState("")
  const [newLessonTitleEn, setNewLessonTitleEn] = useState("")
  const [newLessonDuration, setNewLessonDuration] = useState("")

  const fetchData = () => {
    if (!id) return
    Promise.all([
      fetch(`/api/admin/courses/${id}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${id}/curriculum`).then((r) => r.json()),
      fetch("/api/admin/exams").then((r) => r.json()),
      fetch("/api/admin/homework").then((r) => r.json()),
    ])
      .then(([courseRes, curriculumRes, examsRes, homeworkRes]) => {
        setCourse(courseRes.course)
        setSections(curriculumRes.sections ?? [])
        setExams(examsRes.exams ?? [])
        setHomework(homeworkRes.homework ?? [])
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSectionTitleAr.trim() || !newSectionTitleEn.trim()) return
    try {
      const res = await fetch(`/api/admin/courses/${id}/curriculum`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: newSectionTitleAr.trim(),
          titleEn: newSectionTitleEn.trim(),
          order: sections.length,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "فشل إضافة القسم")
      setNewSectionTitleAr("")
      setNewSectionTitleEn("")
      setAddingSection(false)
      fetchData()
      showToast("تم إضافة القسم بنجاح")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "فشل إضافة القسم", "error")
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("حذف هذا القسم وجميع دروسه؟")) return
    try {
      const res = await fetch(
        `/api/admin/courses/${id}/curriculum/sections/${sectionId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed")
      fetchData()
      showToast("تم حذف القسم")
    } catch {
      showToast("فشل الحذف", "error")
    }
  }

  const handleAddLesson = async (e: React.FormEvent, sectionId: number) => {
    e.preventDefault()
    if (!newLessonTitleAr.trim() || !newLessonTitleEn.trim()) return
    try {
      const res = await fetch(
        `/api/admin/courses/${id}/curriculum/sections/${sectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titleAr: newLessonTitleAr.trim(),
            titleEn: newLessonTitleEn.trim(),
            duration: newLessonDuration.trim() || null,
            order: 0,
          }),
        }
      )
      if (!res.ok) throw new Error("Failed")
      setNewLessonTitleAr("")
      setNewLessonTitleEn("")
      setNewLessonDuration("")
      setAddingLesson(null)
      fetchData()
      showToast("تم إضافة الدرس")
    } catch {
      showToast("فشل إضافة الدرس", "error")
    }
  }

  const handleDeleteLesson = async (sectionId: number, lessonId: number) => {
    if (!confirm("حذف هذا الدرس؟")) return
    try {
      const res = await fetch(
        `/api/admin/courses/${id}/curriculum/sections/${sectionId}/lessons/${lessonId}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("Failed")
      fetchData()
      showToast("تم حذف الدرس")
    } catch {
      showToast("فشل حذف الدرس", "error")
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/courses" className="hover:text-[#2563EB]">
          دوراتي
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <Link href={`/admin/courses/${id}`} className="hover:text-[#2563EB]">
          {course?.titleAr || "الدورة"}
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-zinc-900 dark:text-white">إضافة محتوى الدورة</span>
      </div>

      <h2 className="text-xl font-bold text-[#0F172A]">إضافة محتوى الدورة</h2>

      <p className="text-sm text-[#64748B]">
        أضف الأقسام والدروس. يتم حساب عدد الدروس والأقسام تلقائياً في صفحة تعديل الدورة.
      </p>

      <Card>
        <CardContent className="py-6 space-y-4">
          {sections.map((section) => (
            <Collapsible key={section.id} defaultOpen>
              <div className="rounded-lg border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center gap-2 bg-[#F8FAFC] px-4 py-3">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-start hover:bg-[#F1F5F9] transition-colors -m-2 p-2 rounded"
                    >
                      <GripVertical className="h-4 w-4 text-[#94A3B8]" />
                      <span className="font-semibold text-[#0F172A]">
                        {section.titleAr}
                      </span>
                      <span className="text-sm text-[#64748B]">
                        ({section.lessons.length} درس)
                      </span>
                      <ChevronDown className="h-4 w-4 me-auto text-[#94A3B8]" />
                    </button>
                  </CollapsibleTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CollapsibleContent>
                  <div className="border-t border-[#E2E8F0] p-4 space-y-3">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id} className="space-y-2">
                        {editingLesson?.sectionId === section.id &&
                        editingLesson?.lesson.id === lesson.id ? (
                          <LessonEditor
                            courseId={id}
                            sectionId={section.id}
                            lesson={lesson}
                            exams={exams}
                            homework={homework}
                            onSaved={() => {
                              setEditingLesson(null)
                              fetchData()
                            }}
                            onCancel={() => setEditingLesson(null)}
                          />
                        ) : (
                          <div className="flex items-center gap-3 rounded-md bg-white border border-[#E2E8F0] px-3 py-2">
                            <GripVertical className="h-4 w-4 text-[#94A3B8]" />
                            <span className="flex-1 text-sm">{lesson.titleAr}</span>
                            {lesson.duration && (
                              <span className="text-xs text-[#64748B]">
                                {lesson.duration}
                              </span>
                            )}
                            {(lesson.videoUrl || lesson.videoPath || (lesson.attachments?.length ?? 0) > 0 || lesson.examId || lesson.homeworkId) && (
                              <span className="text-xs text-[#2563EB]">محتوى</span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                setEditingLesson({ sectionId: section.id, lesson })
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDeleteLesson(section.id, lesson.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {addingLesson === section.id ? (
                      <form
                        onSubmit={(e) => handleAddLesson(e, section.id)}
                        className="flex flex-col gap-2 p-3 rounded-md border border-dashed border-[#2563EB] bg-[#EFF6FF]"
                      >
                        <Input
                          placeholder="عنوان الدرس (عربي)"
                          value={newLessonTitleAr}
                          onChange={(e) =>
                            setNewLessonTitleAr(e.target.value)
                          }
                          required
                        />
                        <Input
                          placeholder="Lesson title (English)"
                          value={newLessonTitleEn}
                          onChange={(e) =>
                            setNewLessonTitleEn(e.target.value)
                          }
                          required
                        />
                        <Input
                          placeholder="المدة (مثال: 5:30)"
                          value={newLessonDuration}
                          onChange={(e) =>
                            setNewLessonDuration(e.target.value)
                          }
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm">
                            إضافة
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAddingLesson(null)
                              setNewLessonTitleAr("")
                              setNewLessonTitleEn("")
                              setNewLessonDuration("")
                            }}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setAddingLesson(section.id)}
                      >
                        <Plus className="h-4 w-4 me-2" />
                        إضافة درس
                      </Button>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

          {addingSection ? (
            <form
              onSubmit={handleAddSection}
              className="flex flex-col gap-3 p-4 rounded-lg border-2 border-dashed border-[#2563EB] bg-[#EFF6FF]"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>عنوان القسم (عربي)</Label>
                  <Input
                    value={newSectionTitleAr}
                    onChange={(e) => setNewSectionTitleAr(e.target.value)}
                    placeholder="مثال: مقدمة الدورة"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان القسم (إنجليزي)</Label>
                  <Input
                    value={newSectionTitleEn}
                    onChange={(e) => setNewSectionTitleEn(e.target.value)}
                    placeholder="e.g. Course Introduction"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">إضافة القسم</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddingSection(false)
                    setNewSectionTitleAr("")
                    setNewSectionTitleEn("")
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setAddingSection(true)}
            >
              <Plus className="h-4 w-4 me-2" />
              إضافة قسم جديد
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href={`/admin/courses/${id}/edit`}>
          <Button variant="outline">العودة لتعديل الدورة</Button>
        </Link>
        <Link href={`/admin/courses/${id}`}>
          <Button>عرض تفاصيل الدورة</Button>
        </Link>
      </div>
    </div>
  )
}
