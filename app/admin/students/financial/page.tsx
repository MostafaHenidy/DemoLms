"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function StudentsFinancialPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">الحسابات المالية للطلاب</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="payments"
            title="الحسابات المالية"
            description="عرض الحسابات المالية والمديونيات للطلاب."
          />
        </CardContent>
      </Card>
    </div>
  )
}
