"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function StudentsReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">تقارير الطلاب</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="payments"
            title="تقارير الطلاب"
            description="تقارير مالية للطلاب."
          />
        </CardContent>
      </Card>
    </div>
  )
}
