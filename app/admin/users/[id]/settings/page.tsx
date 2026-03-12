"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function UserSettingsPage() {
  const params = useParams()
  const id = params.id

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/instructors"
          className="text-muted-foreground hover:text-foreground"
        >
          المدرسين
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">إعدادات المدرس #{id}</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">إعدادات المدرس</h2>
          <p className="text-sm text-muted-foreground">
            إدارة إعدادات العمولة والأجر للمدرس.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            نموذج إعدادات المدرس (قيد التطوير).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
