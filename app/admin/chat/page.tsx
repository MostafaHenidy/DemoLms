"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">
        المحادثات
      </h2>

      <Card>
        <CardContent className="py-12">
          <div className="text-center text-[#94A3B8]">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>المحادثات قيد التطوير.</p>
            <p className="text-sm mt-2">
              ستتمكن من الدردشة مع الطلاب والمستخدمين من هنا.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
