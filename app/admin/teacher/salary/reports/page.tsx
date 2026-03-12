"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function SalaryReportsPage() {
  const [month, setMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    sessionsCount: number
    studentsCount: number
    totalRevenue: number
    teacherShare: number
  } | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setResult(null)
    try {
      const start = startOfMonth(month)
      const end = endOfMonth(month)

      const res = await fetch("/api/admin/teachers/me/calculate-salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setResult({
          sessionsCount: data.sessionsCount ?? 0,
          studentsCount: data.studentsCount ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
          teacherShare: data.teacherShare ?? 0,
        })
      }
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">
        تقاريري المالية
      </h2>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="font-semibold">تقرير الراتب</h3>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(month, "MMMM yyyy", { locale: ar })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={month}
                  onSelect={(d) => d && setMonth(d)}
                  defaultMonth={month}
                />
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={handleFetch} disabled={loading}>
              {loading ? "جاري التحميل..." : "عرض"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="py-12 text-center text-[#94A3B8]">
              اختر الشهر واضغط "عرض" لعرض التقرير.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-[#94A3B8]">عدد الحصص</p>
                <p className="text-xl font-bold">{result.sessionsCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-[#94A3B8]">عدد الطلاب</p>
                <p className="text-xl font-bold">{result.studentsCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-[#94A3B8]">إجمالي المبيعات</p>
                <p className="text-xl font-bold">{result.totalRevenue} ريال</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-[#94A3B8]">مستحقاتي</p>
                <p className="text-xl font-bold text-[#2563EB]">
                  {result.teacherShare} ج.م
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
