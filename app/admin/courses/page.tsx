"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Eye, Pencil, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAdminUser } from "@/lib/admin-auth"

interface Course {
  id: number
  titleAr: string
  titleEn: string
  slug: string
  students: number
  price: number
  status: string
  isFeatured: boolean
  category: string
}

export default function AdminCoursesPage() {
  const user = getAdminUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "10")
      if (user?.role === "instructor" && user?.id) {
        params.set("instructorId", String(user.id))
      }
      if (search) params.set("search", search)
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/admin/courses?${params}`)
      const data = await res.json()
      setCourses(data.courses || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [page, user?.id, statusFilter])

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== undefined) fetchCourses()
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-[#0F172A]">دوراتي</h2>
        <Link href="/admin/courses/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة دورة
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <Input
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="published">منشور</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              لا توجد دورات.{" "}
              <Link href="/admin/courses/new" className="text-[#2563EB] hover:underline">
                إضافة دورة جديدة
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدورة</TableHead>
                  <TableHead>الطلاب</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-start">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="font-medium">{course.titleAr}</div>
                      <div className="text-xs text-[#94A3B8]">{course.category}</div>
                    </TableCell>
                    <TableCell>{course.students}</TableCell>
                    <TableCell>{course.price} ريال</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === "published"
                            ? "bg-green-100 text-green-700"
                            : course.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-[#F1F5F9] text-[#64748B]"
                        }`}
                      >
                        {course.status === "published"
                          ? "منشور"
                          : course.status === "draft"
                            ? "مسودة"
                            : "مؤرشف"}
                      </span>
                    </TableCell>
                    <TableCell className="text-start">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/courses/${course.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/courses/${course.id}/curriculum`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <BookOpen className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                السابق
              </Button>
              <span className="flex items-center px-4 text-sm text-[#64748B]">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
