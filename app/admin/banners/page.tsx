"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">البانرات</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="file"
            title="لا توجد بانرات"
            description="إضافة بانر جديد للصفحة الرئيسية."
            action={{
              label: "إضافة بانر",
              onClick: () => {},
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
