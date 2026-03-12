"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Country {
  id: number
  nameAr: string
  nameEn: string
  code: string | null
}

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Country | null>(null)
  const [deleting, setDeleting] = useState<Country | null>(null)
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    code: "",
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCountries = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/countries")
      const data = await res.json()
      if (!res.ok) {
        setCountries([])
        setError(data.detail || data.error || "فشل تحميل الدول")
        return
      }
      setCountries(data.countries || [])
      setError(null)
    } catch {
      setCountries([])
      setError("فشل تحميل الدول")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
  }, [])

  const openAddDialog = () => {
    setEditing(null)
    setForm({
      nameAr: "",
      nameEn: "",
      code: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (country: Country) => {
    setEditing(country)
    setForm({
      nameAr: country.nameAr,
      nameEn: country.nameEn,
      code: country.code ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitLoading(true)
    try {
      const payload = {
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        code: form.code || null,
      }

      let res: Response
      if (editing) {
        res = await fetch(`/api/admin/countries/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch("/api/admin/countries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || data.error || (editing ? "فشل التحديث" : "فشل الإضافة"))
        return
      }

      setDialogOpen(false)
      await fetchCountries()
    } catch {
      setError("حدث خطأ")
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/countries/${deleting.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل الحذف")
        return
      }
      setDeleteDialogOpen(false)
      setDeleting(null)
      await fetchCountries()
    } catch {
      setError("حدث خطأ")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-foreground">الدول</h2>
        <Button onClick={openAddDialog} className="shrink-0">
          إضافة دولة
        </Button>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            إدارة قائمة الدول المتاحة في المنصة.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              جاري التحميل...
            </div>
          ) : countries.length === 0 ? (
            <EmptyState
              icon="users"
              title="لا توجد دول"
              description="أضف دولاً جديدة للقائمة."
              action={{
                label: "إضافة دولة",
                onClick: () => openAddDialog(),
              }}
            />
          ) : (
            <div className="space-y-2">
              {countries.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{c.nameAr}</span>
                    <span className="text-sm text-muted-foreground">
                      {c.nameEn}
                      {c.code && (
                        <span className="ms-2 text-xs">({c.code})</span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(c)}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDeleting(c)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="mt-4 text-sm text-destructive">{error}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "تعديل الدولة" : "إضافة دولة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="nameAr">الاسم بالعربية</Label>
              <Input
                id="nameAr"
                value={form.nameAr}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameAr: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
              <Input
                id="nameEn"
                value={form.nameEn}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nameEn: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">كود الدولة (اختياري)</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="مثال: EG, SA"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading
                  ? "جاري الحفظ..."
                  : editing
                  ? "حفظ"
                  : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الدولة &quot;{deleting?.nameAr}&quot;؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
