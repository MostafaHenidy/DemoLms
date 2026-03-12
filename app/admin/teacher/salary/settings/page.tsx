"use client"

import { useEffect, useState } from "react"
import { Loader2, Info } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Settings {
  workType: string
  calculationMethod: string
  fixedAmount?: number
  percentage?: number
  fixedBaseAmount?: number
  percentageOnTop?: number
}

export default function SalarySettingsPage() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/teachers/me/salary-settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings || null)
        setMessage(d.message || null)
      })
      .catch(() => setSettings(null))
      .finally(() => setLoading(false))
  }, [])

  const workTypeLabel = (w: string) =>
    w === "offline" ? "أوفلاين فقط" : w === "online" ? "أونلاين فقط" : "أوفلاين + أونلاين"

  const methodLabel = (m: string) =>
    m === "fixed_per_session"
      ? "أجر ثابت بالحصة"
      : m === "percentage"
        ? "نسبة من المبيعات"
        : "أجر ثابت + نسبة"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">
        إعدادات الأجر
      </h2>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <h3 className="font-semibold">إعدادات احتساب الأجر</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          {!settings ? (
            <div className="py-8 text-center text-[#94A3B8]">
              <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">
                {message || "لم يتم تعيين إعدادات الأجر بعد."}
              </p>
              <p className="text-sm mt-2">
                تواصل مع مسؤول النظام لتعيين إعدادات احتساب مستحقاتك.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4 flex gap-3">
                <Info className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  يتم احتساب مستحقاتك تلقائياً وفق الإعدادات أدناه. تعديل هذه القيم
                  متاح من خلال مسؤول النظام فقط.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">نوع العمل</p>
                  <p className="font-medium">{workTypeLabel(settings.workType)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">طريقة الاحتساب</p>
                  <p className="font-medium">{methodLabel(settings.calculationMethod)}</p>
                </div>
              </div>

              {settings.calculationMethod === "fixed_per_session" && settings.fixedAmount && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">الأجر بالحصة (ج.م)</p>
                  <p className="font-medium">{settings.fixedAmount}</p>
                </div>
              )}

              {settings.calculationMethod === "percentage" && settings.percentage && (
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">النسبة المئوية</p>
                  <p className="font-medium">{settings.percentage}%</p>
                </div>
              )}

              {settings.calculationMethod === "fixed_plus_percentage" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">الأجر الثابت الأساسي (ج.م)</p>
                    <p className="font-medium">{settings.fixedBaseAmount ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] mb-1">النسبة الإضافية</p>
                    <p className="font-medium">{settings.percentageOnTop ?? "—"}%</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
