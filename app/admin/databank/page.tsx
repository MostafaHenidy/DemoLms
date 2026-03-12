"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Database } from "lucide-react"

export default function DatabankPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">
        بنك البيانات
      </h2>

      <Card>
        <CardContent className="py-12">
          <div className="text-center text-[#94A3B8]">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>بنك البيانات قيد التطوير.</p>
            <p className="text-sm mt-2">
              تصفح المجلدات والموارد (PDF، فيديو، مستندات) واستيراد/تصدير للمناهج.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
