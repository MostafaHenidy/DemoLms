"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategorySelect } from "@/components/admin/category-select"
import { CoverImageUpload } from "@/components/admin/cover-image-upload"
import { getAdminUser } from "@/lib/admin-auth"

export default function NewCoursePage() {
  const router = useRouter()
  const user = getAdminUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    titleAr: "",
    titleEn: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    level: "beginner",
    hours: "0",
    lessons: "0",
    sections: "0",
    status: "draft",
    isFeatured: false,
    coverImageUrl: null as string | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const payload = {
        ...form,
        instructorId: user?.role === "instructor" ? user.id : undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : undefined,
        price: parseInt(form.price, 10) || 0,
        originalPrice: parseInt(form.originalPrice, 10) || parseInt(form.price, 10) || 0,
        hours: parseInt(form.hours, 10) || 0,
        lessons: parseInt(form.lessons, 10) || 0,
        sections: parseInt(form.sections, 10) || 0,
        coverImageUrl: form.coverImageUrl,
      }

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل إنشاء الدورة")
        return
      }

      router.push(`/admin/courses/${data.course.id}`)
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/admin/courses" className="hover:text-[#2563EB]">
          دوراتي
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-[#0F172A]">إضافة دورة</span>
      </div>

      <h2 className="text-xl font-bold text-[#0F172A]">إضافة دورة</h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>معلومات الدورة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>صورة الغلاف</Label>
              <CoverImageUpload
                value={form.coverImageUrl}
                onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleAr">العنوان (عربي)</Label>
                <Input
                  id="titleAr"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                  placeholder="عنوان الدورة بالعربية"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">العنوان (إنجليزي)</Label>
                <Input
                  id="titleEn"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                  placeholder="Course title in English"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">السعر (ريال)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">السعر الأصلي (ريال)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <CategorySelect
                  value={form.categoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>المستوى</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm((f) => ({ ...f, level: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="published">منشور</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="hours">عدد الساعات</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessons">عدد الدروس</Label>
                <Input
                  id="lessons"
                  type="number"
                  min="0"
                  value={form.lessons}
                  onChange={(e) => setForm((f) => ({ ...f, lessons: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sections">عدد الأقسام</Label>
                <Input
                  id="sections"
                  type="number"
                  min="0"
                  value={form.sections}
                  onChange={(e) => setForm((f) => ({ ...f, sections: e.target.value }))}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الحفظ..." : "إنشاء الدورة"}
              </Button>
              <Link href="/admin/courses">
                <Button type="button" variant="outline">
                  إلغاء
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
