"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EditDatabankResourcePage() {
  const params = useParams()
  const id = params.id

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/databank"
          className="text-muted-foreground hover:text-foreground"
        >
          بنك البيانات
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">تعديل المورد #{id}</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">تعديل المورد</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">تعديل بيانات المورد (قيد التطوير).</p>
        </CardContent>
      </Card>
    </div>
  )
}
