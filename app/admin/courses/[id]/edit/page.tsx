"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/admin/courses/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([courseData, catData]) => {
        const c = courseData.course
        const cats = catData.categories ?? []
        if (c) {
          let categoryId = c.categoryId != null ? String(c.categoryId) : ""
          if (!categoryId && c.category) {
            const match = cats.find((cat: { slug: string }) => cat.slug === c.category)
            if (match) categoryId = String(match.id)
          }
          setForm({
            titleAr: c.titleAr || "",
            titleEn: c.titleEn || "",
            price: String(c.price ?? 0),
            originalPrice: String(c.originalPrice ?? c.price ?? 0),
            categoryId,
            level: c.level || "beginner",
            hours: String(c.hours ?? 0),
            lessons: String(c.lessons ?? 0),
            sections: String(c.sections ?? 0),
            status: c.status || "draft",
            isFeatured: !!c.isFeatured,
            coverImageUrl: c.coverImageUrl ?? null,
          })
        }
      })
      .finally(() => setFetching(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { lessons, sections, ...payload } = form
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
          price: parseInt(form.price, 10) || 0,
          originalPrice: parseInt(form.originalPrice, 10) || parseInt(form.price, 10) || 0,
          hours: parseInt(form.hours, 10) || 0,
          coverImageUrl: form.coverImageUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "فشل التحديث")
        return
      }

      router.push(`/admin/courses/${id}`)
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/admin/courses" className="hover:text-purple-500">
          دوراتي
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <Link href={`/admin/courses/${id}`} className="hover:text-[#2563EB]">
          تفاصيل
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-[#0F172A]">تعديل</span>
      </div>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">تعديل الدورة</h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>معلومات الدورة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleAr">العنوان (عربي)</Label>
                <Input
                  id="titleAr"
                  value={form.titleAr}
                  onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleEn">العنوان (إنجليزي)</Label>
                <Input
                  id="titleEn"
                  value={form.titleEn}
                  onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
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
                  readOnly
                  className="bg-[#F8FAFC]"
                  title="يُحسب تلقائياً من محتوى المنهج"
                />
                <p className="text-xs text-[#64748B]">
                  <Link href={`/admin/courses/${id}/curriculum`} className="text-[#2563EB] hover:underline">
                    أضف المحتوى من صفحة المنهج
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sections">عدد الأقسام</Label>
                <Input
                  id="sections"
                  type="number"
                  min="0"
                  value={form.sections}
                  readOnly
                  className="bg-[#F8FAFC]"
                  title="يُحسب تلقائياً من محتوى المنهج"
                />
                <p className="text-xs text-[#64748B]">
                  <Link href={`/admin/courses/${id}/curriculum`} className="text-[#2563EB] hover:underline">
                    أضف المحتوى من صفحة المنهج
                  </Link>
                </p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Link href={`/admin/courses/${id}`}>
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
