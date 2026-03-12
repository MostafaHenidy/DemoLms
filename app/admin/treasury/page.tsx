"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TreasuryPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إدارة الخزنة</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/treasury">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">الخزنات</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">إدارة الخزنات (نقدي، تحويل، محفظة).</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/treasury/revenue">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">الإيرادات</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">إدارة الإيرادات.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/treasury/expenses">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">المصروفات</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">إضافة المصروفات.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/treasury/transactions">
          <Card className="rounded-xl border border-border/50 hover:border-[#2563EB]/30 transition-colors">
            <CardHeader>
              <h3 className="font-semibold">سجل الحركات</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">عرض جميع الحركات.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            إنشاء خزنة جديدة، إضافة مصروف، أو عرض سجل الحركات.
          </p>
          <Button className="mt-4">إنشاء خزنة</Button>
        </CardContent>
      </Card>
    </div>
  )
}
