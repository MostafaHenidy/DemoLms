"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  instructorId: number | null
}

interface User {
  id: number
  name: string
  email: string
}

export default function AttendanceRegisterPage() {
  const user = getAdminUser()
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    courseId: "",
    userId: "",
    sessionType: "offline",
    sessionDate: new Date().toISOString().slice(0, 10),
    sessionTime: "10:00",
    price: "",
    paymentStatus: "unpaid",
    paidAmount: "",
    paymentMethod: "cash",
  })

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      fetch(`/api/admin/courses?limit=100&instructorId=${user.id}`).then((r) =>
        r.json()
      ),
      fetch("/api/admin/users?limit=200&role=student").then((r) => r.json()),
    ]).then(([coursesData, usersData]) => {
      setCourses(coursesData.courses || [])
      setUsers(usersData.users || [])
    })
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.courseId || !form.userId) return
    const course = courses.find((c) => c.id === parseInt(form.courseId, 10))
    const teacherId = course?.instructorId || user?.id

    setLoading(true)
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          courseId: parseInt(form.courseId, 10),
          userId: parseInt(form.userId, 10),
          sessionType: form.sessionType,
          sessionDate: form.sessionDate,
          sessionTime: form.sessionTime,
          price: form.price ? parseInt(form.price, 10) : null,
          paymentStatus: form.paymentStatus,
          paidAmount: form.paidAmount ? parseInt(form.paidAmount, 10) : null,
          paymentMethod: form.paymentMethod,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "فشل التسجيل")
        return
      }

      setForm((f) => ({
        ...f,
        userId: "",
        sessionDate: new Date().toISOString().slice(0, 10),
      }))
      alert("تم تسجيل الحضور بنجاح")
    } catch {
      alert("حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/teacher/attendance" className="hover:text-[#2563EB]">
          الحضور
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-[#0F172A]">تسجيل حضور</span>
      </div>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
        تسجيل حضور
      </h2>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>تسجيل حضور يدوي</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>الدورة</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدورة" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.titleAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الطالب</Label>
              <Select
                value={form.userId}
                onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع الجلسة</Label>
                <Select
                  value={form.sessionType}
                  onValueChange={(v) => setForm((f) => ({ ...f, sessionType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">أوفلاين</SelectItem>
                    <SelectItem value="online">أونلاين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ الجلسة</Label>
                <Input
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>وقت الجلسة</Label>
                <Input
                  type="time"
                  value={form.sessionTime}
                  onChange={(e) => setForm((f) => ({ ...f, sessionTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>السعر (ريال)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>حالة الدفع</Label>
                <Select
                  value={form.paymentStatus}
                  onValueChange={(v) => setForm((f) => ({ ...f, paymentStatus: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">غير مدفوع</SelectItem>
                    <SelectItem value="partial">جزئي</SelectItem>
                    <SelectItem value="paid">مدفوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.paymentStatus === "paid" && (
                <div className="space-y-2">
                  <Label>المبلغ المدفوع</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.paidAmount}
                    onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "جاري التسجيل..." : "تسجيل الحضور"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
