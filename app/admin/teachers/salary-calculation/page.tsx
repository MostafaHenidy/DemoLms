"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function TeacherSalaryCalculationPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">حساب أجر المدرسين</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="file"
            title="حساب الأجر"
            description="حساب الأجر المستحق للمدرسين حسب الجلسات والعمولات."
          />
        </CardContent>
      </Card>
    </div>
  )
}
