"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface AttendanceRecord {
  id: number
  sessionDate: string
  sessionTime: string | null
  sessionType: string
  price: number | null
  paymentStatus: string
  courseId: number
  userId: number
}

interface Course {
  id: number
  titleAr: string
}

export default function TeacherAttendancePage() {
  const user = getAdminUser()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [courseFilter, setCourseFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/admin/courses?limit=100&instructorId=${user.id}`)
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    const params = new URLSearchParams()
    params.set("teacherId", String(user.id))
    params.set("limit", "100")
    if (courseFilter && courseFilter !== "all") params.set("courseId", courseFilter)

    fetch(`/api/admin/attendance?${params}`)
      .then((r) => r.json())
      .then((d) => setRecords(d.attendance || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [user?.id, courseFilter])

  const paymentStatusLabel = (s: string) =>
    s === "paid" ? "مدفوع" : s === "partial" ? "جزئي" : "غير مدفوع"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-[#0F172A]">
          سجل الحضور
        </h2>
        <Link href="/admin/attendance/register">
          <Button className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            تسجيل حضور
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="font-semibold">سجلات الحضور</h3>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="تصفية بالدورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الدورات</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.titleAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              لا توجد سجلات حضور.
              <Link href="/admin/attendance/register" className="block mt-2 text-[#2563EB] hover:underline">
                تسجيل حضور جديد
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الوقت</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>حالة الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {new Date(r.sessionDate).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>{r.sessionTime || "—"}</TableCell>
                    <TableCell>
                      {r.sessionType === "online" ? "أونلاين" : "أوفلاين"}
                    </TableCell>
                    <TableCell>{r.price ?? "—"} ريال</TableCell>
                    <TableCell>{paymentStatusLabel(r.paymentStatus)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
