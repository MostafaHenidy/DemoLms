"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">الشهادات</h2>
        <Link href="/admin/certificates/templates/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إنشاء قالب شهادة
          </Button>
        </Link>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="file"
            title="لا توجد شهادات"
            description="عرض الشهادات الصادرة وقوالب الشهادات."
            action={{
              label: "إنشاء قالب",
              onClick: () => (window.location.href = "/admin/certificates/templates/new"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
