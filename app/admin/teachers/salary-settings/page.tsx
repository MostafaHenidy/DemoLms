"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function TeacherSalarySettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إعدادات أجر المدرسين</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="file"
            title="إعدادات الأجر"
            description="تحديد طريقة حساب أجر كل مدرس (ثابت، نسبة، أو مزيج)."
          />
        </CardContent>
      </Card>
    </div>
  )
}
