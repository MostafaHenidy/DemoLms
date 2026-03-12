"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function LecturesPage() {
  const params = useParams()
  const id = params?.id as string
  const [course, setCourse] = useState<{ titleAr: string } | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/courses/${id}`)
      .then((res) => res.json())
      .then((data) => setCourse(data.course))
      .catch(() => setCourse(null))
  }, [id])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/courses" className="hover:text-[#2563EB]">
          دوراتي
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <Link href={`/admin/courses/${id}`} className="hover:text-purple-500">
          {course?.titleAr || "الدورة"}
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-[#0F172A]">إدارة المحاضرات</span>
      </div>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        إدارة المحاضرات
      </h2>

      <Card>
        <CardContent className="py-12">
          <div className="text-center text-[#94A3B8]">
            <p>إدارة المحاضرات قيد التطوير.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
