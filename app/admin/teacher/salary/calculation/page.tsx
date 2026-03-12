"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export default function SalaryCalculationPage() {
  const [month, setMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    sessionsCount: number
    studentsCount: number
    totalRevenue: number
    teacherShare: number
    centerProfit: number
  } | null>(null)

  const handleCalculate = async () => {
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
          centerProfit: data.centerProfit ?? 0,
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
        حساب الأجر
      </h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <h3 className="font-semibold">احتساب المستحقات</h3>
          <p className="text-sm text-[#94A3B8]">
            اختر الشهر ثم اضغط على "احتساب" لعرض مستحقاتك.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(month, "MMMM yyyy", { locale: ar })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={month}
                  onSelect={(d) => d && setMonth(d)}
                  defaultMonth={month}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleCalculate} disabled={loading} className="gap-2">
              <Calculator className="w-4 h-4" />
              {loading ? "جاري الاحتساب..." : "احتساب"}
            </Button>
          </div>

          {result && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-[#94A3B8]">عدد الحصص</p>
                  <p className="text-2xl font-bold">{result.sessionsCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-[#94A3B8]">عدد الطلاب</p>
                  <p className="text-2xl font-bold">{result.studentsCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-[#94A3B8]">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold">{result.totalRevenue} ريال</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs text-[#94A3B8]">مستحقاتي</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.teacherShare} ج.م
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
