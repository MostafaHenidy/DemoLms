"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-foreground">إعدادات التطبيق</h2>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h3 className="text-lg font-semibold">معلومات التطبيق</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم التطبيق</Label>
            <Input placeholder="أكاديمية أنمكا" />
          </div>
          <div className="space-y-2">
            <Label>الحد الأدنى للإصدار</Label>
            <Input placeholder="1.0.0" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h3 className="text-lg font-semibold">Fatoorak</h3>
          <p className="text-sm text-muted-foreground">
            إعدادات بوابة الدفع.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>مفتاح API</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="flex items-center justify-between">
            <Label>وضع الاختبار</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h3 className="text-lg font-semibold">WhatsApp</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input placeholder="+966xxxxxxxxx" />
          </div>
          <div className="flex items-center justify-between">
            <Label>مفعّل</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Button>حفظ التغييرات</Button>
    </div>
  )
}
