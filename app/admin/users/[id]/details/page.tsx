"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"

interface UserDetails {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  phone: string | null
  country: string | null
  category: string | null
  parentNumber: string | null
  role: string
  titleAr: string | null
  titleEn: string | null
  status: string
  createdAt: string
}

interface CountryOption {
  id: number
  nameAr: string
  nameEn: string
}

interface CategoryOption {
  id: number
  nameAr: string
  nameEn: string
}

export default function UserDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { showToast } = useStore()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    category: "",
    parentNumber: "",
    role: "student",
    status: "active",
  })
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const fetchUser = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل تحميل البيانات")
      const u = data.user
      setUser(u)
      setForm({
        name: u.name ?? "",
        email: u.email ?? "",
        phone: u.phone ?? "",
        country: u.country ?? "",
        category: u.category ?? "",
        parentNumber: u.parentNumber ?? "",
        role: u.role ?? "student",
        status: u.status ?? "active",
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/countries").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([countriesRes, categoriesRes]) => {
      setCountries(countriesRes.countries ?? [])
      setCategories(categoriesRes.flat ?? [])
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل الحفظ")
      setUser((prev) => (prev ? { ...prev, ...form } : null))
      showToast("تم حفظ التعديلات بنجاح")
    } catch (e) {
      showToast(e instanceof Error ? e.message : "حدث خطأ", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="text-muted-foreground hover:text-foreground"
          >
            المستخدمين
          </Link>
        </div>
        <Card className="rounded-xl border border-border/50">
          <CardContent className="pt-6">
            <p className="text-destructive">{error ?? "المستخدم غير موجود"}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchUser()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/users"
          className="text-muted-foreground hover:text-foreground"
        >
          المستخدمين
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">تفاصيل المستخدم: {user.name}</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">تفاصيل الطالب</h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList>
              <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
              <TabsTrigger value="enrollments">الاشتراكات</TabsTrigger>
              <TabsTrigger value="exams">الاختبارات</TabsTrigger>
              <TabsTrigger value="attendance">الحضور</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              <TabsTrigger value="debts">المديونيات</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="pt-4">
              <p className="text-sm text-muted-foreground mb-6">
                عرض وتعديل بيانات المستخدم.
              </p>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentNumber">رقم ولي الأمر</Label>
                    <Input
                      id="parentNumber"
                      value={form.parentNumber}
                      onChange={(e) => setForm((f) => ({ ...f, parentNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">الدولة</Label>
                    <Select
                      value={form.country || "none"}
                      onValueChange={(v) => setForm((f) => ({ ...f, country: v === "none" ? "" : v }))}
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="اختر الدولة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {countries.map((c) => (
                          <SelectItem key={c.id} value={c.nameAr}>
                            {c.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select
                      value={form.category || "none"}
                      onValueChange={(v) => setForm((f) => ({ ...f, category: v === "none" ? "" : v }))}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.nameAr}>
                            {c.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">الدور</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">طالب</SelectItem>
                        <SelectItem value="instructor">مدرب</SelectItem>
                        <SelectItem value="admin">مسؤول</SelectItem>
                        <SelectItem value="super_admin">مدير عام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="blocked">محظور</SelectItem>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="enrollments" className="pt-4">
              <p className="text-sm text-muted-foreground">
                قائمة الدورات المسجل فيها المستخدم.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (قيد التطوير)
              </p>
            </TabsContent>
            <TabsContent value="exams" className="pt-4">
              <p className="text-sm text-muted-foreground">
                محاولات الاختبارات.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (قيد التطوير)
              </p>
            </TabsContent>
            <TabsContent value="attendance" className="pt-4">
              <p className="text-sm text-muted-foreground">
                سجل الحضور.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (قيد التطوير)
              </p>
            </TabsContent>
            <TabsContent value="payments" className="pt-4">
              <p className="text-sm text-muted-foreground">
                سجل المدفوعات.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (قيد التطوير)
              </p>
            </TabsContent>
            <TabsContent value="debts" className="pt-4">
              <p className="text-sm text-muted-foreground">
                المديونيات المستحقة.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                (قيد التطوير)
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
