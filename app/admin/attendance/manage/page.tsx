"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function ManageAttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إدارة الحضور</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="calendar"
            title="لا توجد سجلات"
            description="عرض وتصفية سجلات الحضور."
          />
        </CardContent>
      </Card>
    </div>
  )
}
