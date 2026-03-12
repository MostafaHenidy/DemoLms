"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
  role: z.enum(["student", "instructor", "admin"]),
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  country: z.string().optional(),
  category: z.string().optional(),
  parentNumber: z.string().optional(),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
})

type FormValues = z.infer<typeof formSchema>

export default function AddUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "student",
      name: "",
      email: "",
      phone: "",
      country: "",
      category: "",
      parentNumber: "",
      password: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل إنشاء المستخدم")
      router.push("/admin/users")
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/users"
          className="text-muted-foreground hover:text-foreground"
        >
          المستخدمين
        </Link>
        <ArrowRight className="w-4 h-4 rotate-180 text-muted-foreground" />
        <span className="font-medium">إضافة مستخدم جديد</span>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <h2 className="text-lg font-semibold">إضافة مستخدم جديد</h2>
          <p className="text-sm text-muted-foreground">
            أدخل بيانات المستخدم الجديد.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">طالب</SelectItem>
                        <SelectItem value="instructor">مدرب</SelectItem>
                        <SelectItem value="admin">مسؤول</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="الاسم الكامل" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="example@email.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="05xxxxxxxx" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدولة (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: السعودية" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التصنيف / المجال (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مثال: برمجة، تصميم" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم ولي الأمر (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} placeholder="05xxxxxxxx" dir="ltr" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder="••••••••" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "جاري الحفظ..." : "حفظ"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  إلغاء
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
