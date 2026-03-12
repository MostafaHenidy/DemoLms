"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { ArrowRight, Pencil, BookOpen } from "lucide-react"
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

export default function CourseDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course)
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
        {course.coverImageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={course.coverImageUrl}
              alt={course.titleAr}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}
        <CardHeader>
          <h3 className="text-lg font-semibold">{course.titleAr}</h3>
          <p className="text-sm text-[#94A3B8]">{course.titleEn}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-[#94A3B8]">الطلاب</p>
              <p className="font-semibold">{course.students}</p>
            </div>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[#94A3B8]">الساعات</p>
              <p className="font-semibold">{course.hours}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">الدروس</p>
              <p className="font-semibold">{course.lessons}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8]">الأقسام</p>
              <p className="font-semibold">{course.sections}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
