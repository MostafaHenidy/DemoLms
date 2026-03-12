"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function TreasuryRevenuePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">الإيرادات</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="payments"
            title="الإيرادات"
            description="عرض وإدارة الإيرادات."
          />
        </CardContent>
      </Card>
    </div>
  )
}
