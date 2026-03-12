"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function PendingCoursesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">موافقة الدورات</h2>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            مراجعة الدورات المعلقة واعتمادها أو رفضها.
          </p>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="courses"
            title="لا توجد دورات معلقة"
            description="جميع الدورات تمت مراجعتها."
          />
        </CardContent>
      </Card>
    </div>
  )
}
