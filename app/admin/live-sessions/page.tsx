"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"

export default function LiveSessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">الجلسات المباشرة</h2>
        <Link href="/admin/live-sessions/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            جدولة جلسة
          </Button>
        </Link>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardContent className="pt-6">
          <EmptyState
            icon="calendar"
            title="لا توجد جلسات"
            description="جدول جلسة مباشرة جديدة."
            action={{
              label: "جدولة جلسة",
              onClick: () => (window.location.href = "/admin/live-sessions/new"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
