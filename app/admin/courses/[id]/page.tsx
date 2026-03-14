"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowRight, Pencil, BookOpen, ImageOff, FileText, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Course {
  id: number
  titleAr: string
  titleEn: string
  slug: string
  students: number
  price: number
  originalPrice: number
  category: string
  level: string
  hours: number
  lessons: number
  sections: number
  status: string
  isFeatured: boolean
  coverImageUrl?: string | null
}

interface CurriculumLesson {
  id: number
  titleAr: string
  titleEn: string
  duration?: string | null
  order: number
}

interface CurriculumSection {
  id: number
  titleAr: string
  titleEn: string
  order: number
  lessons: CurriculumLesson[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/admin/courses/${id}`).then((r) => r.json()),
      fetch(`/api/admin/courses/${id}/curriculum`).then((r) => r.json()),
    ])
      .then(([courseData, curriculumData]) => {
        setCourse(courseData.course ?? null)
        setCurriculum(curriculumData.sections ?? [])
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
  }

  if (!course) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#94A3B8]">الدورة غير موجودة.</p>
        <Link href="/admin/courses">
          <Button variant="link" className="mt-2">
            العودة للدورات
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/courses" className="hover:text-[#2563EB]">
          دوراتي
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-zinc-900 dark:text-white">{course.titleAr}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0F172A]">
          تفاصيل الدورة
        </h2>
        <div className="flex gap-2">
          <Link href={`/admin/courses/${course.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              تعديل
            </Button>
          </Link>
          <Link href={`/admin/courses/${course.id}/curriculum`}>
            <Button className="gap-2">
              <BookOpen className="w-4 h-4" />
              إدارة المحتوى
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="relative mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-t-lg bg-[#F1F5F9]">
          {course.coverImageUrl ? (
            <Image
              src={course.coverImageUrl}
              alt={course.titleAr}
              fill
              className="object-cover object-center"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#64748B]">
              <ImageOff className="h-10 w-10" />
              <span className="text-xs">لا توجد صورة غلاف</span>
            </div>
          )}
        </div>
        <CardHeader>
          <h3 className="text-lg font-semibold">{course.titleAr}</h3>
          <p className="text-sm text-[#94A3B8]">{course.titleEn}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E0F2FE] text-[#0369A1]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B]">الطلاب</p>
                <p className="text-lg font-bold text-[#0F172A]">{course.students}</p>
              </div>
            </Link>
            <Link
              href={`/admin/courses/${course.id}/curriculum`}
              className="flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#B45309]">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#64748B]">ساعات الدورة</p>
                <p className="text-lg font-bold text-[#0F172A]">{course.hours} ساعة</p>
              </div>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-[#94A3B8]">السعر</p>
              <p className="font-semibold">{course.price} ريال</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">المستوى</p>
              <p className="font-semibold">
                {course.level === "beginner"
                  ? "مبتدئ"
                  : course.level === "intermediate"
                    ? "متوسط"
                    : "متقدم"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">الحالة</p>
              <p className="font-semibold">
                {course.status === "published"
                  ? "منشور"
                  : course.status === "draft"
                    ? "مسودة"
                    : "مؤرشف"}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">الدروس / الأقسام</p>
              <p className="font-semibold">{course.lessons} درس — {course.sections} قسم</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {curriculum.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">محتوى الدورة</h3>
            <Link href={`/admin/courses/${course.id}/curriculum`}>
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                إدارة المحتوى
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {curriculum.map((section, idx) => (
              <div key={section.id} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2 font-medium text-[#0F172A]">
                  <span className="text-[#64748B]">{idx + 1}.</span>
                  {section.titleAr}
                  <span className="text-xs font-normal text-[#94A3B8]">
                    ({section.lessons?.length ?? 0} درس)
                  </span>
                </div>
                {section.lessons?.length ? (
                  <ul className="mt-3 mr-6 space-y-1.5 text-sm text-[#475569]">
                    {section.lessons.map((lesson, lidx) => (
                      <li key={lesson.id} className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                        <span>{lesson.titleAr}</span>
                        {lesson.duration && (
                          <span className="text-xs text-[#94A3B8]">({lesson.duration})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[#94A3B8]">لا توجد دروس في هذا القسم</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {curriculum.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-[#94A3B8]">لم يُضف محتوى للدورة بعد.</p>
            <Link href={`/admin/courses/${course.id}/curriculum`} className="mt-2 inline-block">
              <Button variant="link" className="gap-2">
                <BookOpen className="w-4 h-4" />
                إضافة أقسام ودروس
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
