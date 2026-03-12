"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MonthlyNotificationsReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">تقارير الإشعارات الشهرية</h2>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            إرسال التقارير الشهرية للطلاب والمدرسين.
          </p>
        </CardHeader>
        <CardContent>
          <Button>إرسال التقارير الشهرية</Button>
        </CardContent>
      </Card>
    </div>
  )
}
