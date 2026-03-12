"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FinancialReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">لوحة التحكم المالية</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/financial-reports/daily">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">التقارير اليومية</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تقارير الإيرادات والمصروفات اليومية.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/financial-reports/monthly">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">التقارير الشهرية</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تقارير شهرية مفصلة.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/financial-reports/students">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">تقارير الطلاب</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تقارير مالية للطلاب.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/financial-reports/teachers">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">تقارير المدرسين</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">تقارير أجر المدرسين.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
