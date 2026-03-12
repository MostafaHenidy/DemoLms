"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  FolderPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface CategoryTreeNode {
  id: number
  nameAr: string
  nameEn: string
  slug: string
  parentId: number | null
  order: number
  coursesCount: number
  children: CategoryTreeNode[]
}

function flattenTree(
  nodes: CategoryTreeNode[],
  result: { id: number; nameAr: string; nameEn: string }[] = []
): { id: number; nameAr: string; nameEn: string }[] {
  for (const node of nodes) {
    result.push({ id: node.id, nameAr: node.nameAr, nameEn: node.nameEn })
    if (node.children.length > 0) {
      flattenTree(node.children, result)
    }
  }
  return result
}

function getDescendantIds(node: CategoryTreeNode, result: number[] = []): number[] {
  result.push(node.id)
  for (const child of node.children) {
    getDescendantIds(child, result)
  }
  return result
}

function countDescendants(node: CategoryTreeNode): number {
  let count = node.children.length
  for (const child of node.children) {
    count += countDescendants(child)
  }
  return count
}

function findCategoryById(nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findCategoryById(node.children, id)
    if (found) return found
  }
  return null
}

interface CategoryRowProps {
  category: CategoryTreeNode
  depth: number
  expanded: Set<number>
  onToggle: (id: number) => void
  onEdit: (c: CategoryTreeNode) => void
  onDelete: (c: CategoryTreeNode) => void
  onAddSub: (parent: CategoryTreeNode) => void
  parentOptions: { id: number; nameAr: string; nameEn: string }[]
}

function CategoryRow({
  category,
  depth,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onAddSub,
  parentOptions,
}: CategoryRowProps) {
  const hasChildren = category.children.length > 0
  const isExpanded = expanded.has(category.id)

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between gap-2 rounded-lg border border-border/50 p-3 hover:bg-muted/50"
        style={{ paddingInlineStart: `${12 + depth * 20}px` }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => hasChildren && onToggle(category.id)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-muted"
            aria-label={isExpanded ? "طي" : "توسيع"}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <span className="font-medium">{category.nameAr}</span>
            <span className="ms-2 text-sm text-muted-foreground">
              ({category.nameEn})
            </span>
            {category.coursesCount > 0 && (
              <span className="ms-2 text-xs text-muted-foreground">
                — {category.coursesCount} دورة
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddSub(category)}
            title="إضافة تصنيف فرعي"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(category)}
            title="تعديل"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(category)}
            title="حذف"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {category.children.map((child) => (
            <CategoryRow
              key={child.id}
              category={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
              parentOptions={parentOptions}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryTreeNode | null>(null)
  const [deleting, setDeleting] = useState<CategoryTreeNode | null>(null)
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    parentId: null as number | null,
    order: 0,
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/categories")
      const data = await res.json()
      if (!res.ok) {
        setCategories([])
        setError(data.error || "فشل تحميل التصنيفات")
        return
      }
      setCategories(data.categories || [])
      setError(null)
    } catch {
      setCategories([])
      setError("فشل تحميل التصنيفات")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const parentOptions = flattenTree(categories)
  const excludedParentIds = editing
    ? (() => {
        const cat = findCategoryById(categories, editing.id)
        return cat ? new Set(getDescendantIds(cat)) : new Set<number>()
      })()
    : new Set<number>()

  const openAddDialog = (parent?: CategoryTreeNode) => {
    setEditing(null)
    setForm({
      nameAr: "",
      nameEn: "",
      parentId: parent?.id ?? null,
      order: 0,
    })
    setDialogOpen(true)
  }

  const openEditDialog = (category: CategoryTreeNode) => {
    setEditing(category)
    setForm({
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      parentId: category.parentId,
      order: category.order,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitLoading(true)
    try {
      if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameAr: form.nameAr,
            nameEn: form.nameEn,
            parentId: form.parentId,
            order: form.order,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "فشل التحديث")
          return
        }
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameAr: form.nameAr,
            nameEn: form.nameEn,
            parentId: form.parentId,
            order: form.order,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "فشل الإضافة")
          return
        }
      }
      setDialogOpen(false)
      fetchCategories()
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
      const res = await fetch(`/api/admin/categories/${deleting.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل الحذف")
        return
      }
      setDeleteDialogOpen(false)
      setDeleting(null)
      fetchCategories()
    } catch {
      setError("حدث خطأ")
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-foreground">التصنيفات</h2>
        <Button onClick={() => openAddDialog()} className="shrink-0">
          <Plus className="h-4 w-4" />
          إضافة تصنيف
        </Button>
      </div>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            إدارة تصنيفات الدورات. إضافة، تعديل، أو حذف التصنيفات.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              جاري التحميل...
            </div>
          ) : categories.length === 0 ? (
            <EmptyState
              icon="courses"
              title="لا توجد تصنيفات"
              description="أضف تصنيفاً جديداً لإدارة دوراتك بشكل أفضل."
              action={{
                label: "إضافة تصنيف",
                onClick: () => openAddDialog(),
              }}
            />
          ) : (
            <div className="space-y-1">
              {categories.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  depth={0}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onEdit={openEditDialog}
                  onDelete={(cat) => {
                    setDeleting(cat)
                    setDeleteDialogOpen(true)
                  }}
                  onAddSub={(parent) => openAddDialog(parent)}
                  parentOptions={parentOptions}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "تعديل التصنيف" : "إضافة تصنيف"}
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
                placeholder="مثال: البرمجة"
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
                placeholder="e.g. Programming"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">التصنيف الأب</Label>
              <Select
                value={form.parentId?.toString() ?? "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    parentId: v === "none" ? null : parseInt(v, 10),
                  }))
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="بدون (تصنيف رئيسي)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون (تصنيف رئيسي)</SelectItem>
                  {parentOptions
                    .filter((p) => !excludedParentIds.has(p.id))
                    .map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.nameAr} ({p.nameEn})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">الترتيب</Label>
              <Input
                id="order"
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order: parseInt(e.target.value, 10) || 0,
                  }))
                }
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
                {submitLoading ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
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
              هل أنت متأكد من حذف التصنيف &quot;{deleting?.nameAr}&quot;؟
              {deleting && countDescendants(deleting) > 0 && (
                <span className="mt-2 block font-medium text-foreground">
                  سيتم حذف {countDescendants(deleting)} تصنيف فرعي أيضاً.
                </span>
              )}
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
