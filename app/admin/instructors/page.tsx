"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DataTable, type Column } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface Instructor {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  role: string
  status: string
  titleAr?: string | null
}

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")

  const fetchInstructors = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "10")
      params.set("role", "instructor")
      if (search) params.set("search", search)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل تحميل البيانات")
      setInstructors(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [page])

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) fetchInstructors()
      else setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const columns: Column<Instructor>[] = [
    {
      key: "instructor",
      header: "المدرب",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">
              {row.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.titleAr ?? row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "البريد الإلكتروني",
      cell: (row) => row.email,
    },
    {
      key: "status",
      header: "الحالة",
      cell: (row) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {row.status === "active" ? "نشط" : "غير نشط"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      cell: (row) => (
        <Link href={`/admin/users/${row.id}/settings`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="w-4 h-4" />
            إعدادات
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">إدارة المدرسين</h2>

      <DataTable<Instructor>
        columns={columns}
        data={instructors}
        isLoading={loading}
        error={error}
        onRetry={fetchInstructors}
        searchPlaceholder="بحث بالاسم أو البريد..."
        onSearch={setSearch}
        searchValue={search}
        emptyState={{
          icon: "users",
          title: "لا يوجد مدرسون",
          description: "لم يتم العثور على مدرسين.",
        }}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  )
}
