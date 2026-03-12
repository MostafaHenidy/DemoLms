"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إدارة الحضور والغياب</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <h3 className="font-semibold">تسجيل الحضور</h3>
            <p className="text-sm text-muted-foreground">
              مسح QR أو البحث اليدوي لتسجيل حضور الطلاب.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/admin/attendance/register">
              <Button>تسجيل حضور</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <h3 className="font-semibold">إدارة الحضور</h3>
            <p className="text-sm text-muted-foreground">
              عرض وتعديل سجلات الحضور.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/admin/attendance/manage">
              <Button variant="outline">إدارة الحضور</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
