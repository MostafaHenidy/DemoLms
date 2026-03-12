"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">الإشعارات</h2>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="notifications"
            title="لا توجد إشعارات"
            description="إنشاء وإرسال إشعارات للمستخدمين."
          />
        </CardContent>
      </Card>
    </div>
  )
}
