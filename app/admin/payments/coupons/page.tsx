"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type CouponDiscountType = "percentage" | "fixed"

interface Coupon {
  id: number
  code: string
  discountType: CouponDiscountType
  discountValue: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  createdAt: string
}

export default function CouponsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [prefix, setPrefix] = useState("")
  const [count, setCount] = useState(10)
  const [discountType, setDiscountType] = useState<CouponDiscountType>("percentage")
  const [discountValue, setDiscountValue] = useState("20")
  const [maxUses, setMaxUses] = useState("1")

  const generatePrefix = () => {
    const words = ["SAVE", "PROMO", "OFF", "DEAL", "ANMKA", "SUMMER", "WELCOME"]
    const word = words[Math.floor(Math.random() * words.length)]
    const num = discountValue ? String(Math.round(Number(discountValue) || 0)).padStart(2, "0") : String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
    setPrefix(`${word}${num}`)
  }

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/coupons")
      const data = await res.json()
      if (res.ok) {
        setCoupons(data.coupons ?? [])
      }
    } catch {
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  useEffect(() => {
    if (dialogOpen) {
      const words = ["SAVE", "PROMO", "OFF", "DEAL", "ANMKA", "SUMMER", "WELCOME"]
      const word = words[Math.floor(Math.random() * words.length)]
      const num = discountValue ? String(Math.round(Number(discountValue) || 0)).padStart(2, "0") : String(Math.floor(Math.random() * 99) + 1).padStart(2, "0")
      setPrefix(`${word}${num}`)
    }
  }, [dialogOpen])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setSubmitLoading(true)

    const prefixTrimmed = prefix.trim().toUpperCase()
    if (!prefixTrimmed) {
      setError("البادئة مطلوبة")
      setSubmitLoading(false)
      return
    }

    const dv = Number(discountValue)
    if (discountType === "percentage" && (isNaN(dv) || dv < 1 || dv > 100)) {
      setError("نسبة الخصم يجب أن تكون بين 1 و 100")
      setSubmitLoading(false)
      return
    }
    if (discountType === "fixed" && (isNaN(dv) || dv <= 0)) {
      setError("قيمة الخصم الثابتة يجب أن تكون أكبر من صفر")
      setSubmitLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: prefixTrimmed,
          count: Math.min(500, Math.max(1, count)),
          discountType,
          discountValue: dv,
          maxUses: Math.max(1, Number(maxUses) || 1),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || data.error || "فشل إنشاء الكوبونات")
        return
      }

      setSuccessMessage(`تم إنشاء ${data.created} كوبون بنجاح`)
      setPrefix("")
      setCount(10)
      setDiscountValue("20")
      setMaxUses("1")
      fetchCoupons()
      setTimeout(() => setDialogOpen(false), 1500)
    } catch {
      setError("فشل الاتصال بالخادم")
    } finally {
      setSubmitLoading(false)
    }
  }

  const hasCoupons = coupons.length > 0

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">الكوبونات</h2>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            إدارة كوبونات الخصم وإنشاؤها بالجملة.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : hasCoupons ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8]"
                >
                  إنشاء كوبونات بالجملة
                </Button>
              </div>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-right p-3 font-medium">الكود</th>
                      <th className="text-right p-3 font-medium">نوع الخصم</th>
                      <th className="text-right p-3 font-medium">القيمة</th>
                      <th className="text-right p-3 font-medium">المستخدم</th>
                      <th className="text-right p-3 font-medium">تاريخ الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="border-t border-border/50">
                        <td className="p-3 font-mono">{c.code}</td>
                        <td className="p-3">
                          {c.discountType === "percentage" ? "نسبة مئوية" : "قيمة ثابتة"}
                        </td>
                        <td className="p-3">
                          {c.discountType === "percentage"
                            ? `${c.discountValue}%`
                            : `${c.discountValue}`}
                        </td>
                        <td className="p-3">
                          {c.usedCount} / {c.maxUses ?? "∞"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="payments"
              title="لا توجد كوبونات"
              description="أضف كوبونات خصم جديدة بالجملة."
              action={{
                label: "إنشاء كوبونات بالجملة",
                onClick: () => setDialogOpen(true),
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>إنشاء كوبونات بالجملة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prefix">البادئة (يبدأ بها كل كود)</Label>
              <div className="flex gap-2">
                <Input
                  id="prefix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="مثال: SAVE أو PROMO"
                  maxLength={20}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generatePrefix}
                  className="shrink-0"
                >
                  توليد تلقائي
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                سيتم إنشاء أكواد مثل: {prefix || "PREFIX"}0001، {prefix || "PREFIX"}0002، ...
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="count">عدد الكوبونات</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
              />
            </div>

            <div className="grid gap-2">
              <Label>نوع الخصم</Label>
              <RadioGroup
                value={discountType}
                onValueChange={(v) => setDiscountType(v as CouponDiscountType)}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="percentage" id="type-percent" />
                  <Label htmlFor="type-percent" className="font-normal cursor-pointer">
                    نسبة مئوية (%)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="fixed" id="type-fixed" />
                  <Label htmlFor="type-fixed" className="font-normal cursor-pointer">
                    قيمة ثابتة
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discountValue">
                {discountType === "percentage" ? "نسبة الخصم (%)" : "قيمة الخصم"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min={discountType === "percentage" ? 1 : 0.01}
                max={discountType === "percentage" ? 100 : undefined}
                step={discountType === "percentage" ? 1 : 0.01}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percentage" ? "20" : "50"}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxUses">الحد الأقصى للاستخدام لكل كوبون</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {successMessage && (
              <p className="text-sm text-emerald-600">{successMessage}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                {submitLoading ? "جاري الإنشاء..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
