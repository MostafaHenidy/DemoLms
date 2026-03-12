"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function NewCertificateTemplatePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/certificates"
          className="text-muted-foreground hover:text-foreground"
        >
          الشهادات
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">إنشاء قالب شهادة</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">إنشاء قالب شهادة</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">رفع صورة القالب وتحديد المتغيرات (قيد التطوير).</p>
        </CardContent>
      </Card>
    </div>
  )
}
