"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function DailyReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">التقارير اليومية</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="payments"
            title="التقارير اليومية"
            description="اختر الفترة لعرض التقرير اليومي."
          />
        </CardContent>
      </Card>
    </div>
  )
}
