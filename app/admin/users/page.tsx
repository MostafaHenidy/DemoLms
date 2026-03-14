"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, UserCheck, UserX, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column, type FilterItem } from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge, getUserStatusBadge } from "@/components/ui/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useStore } from "@/lib/store"

interface User {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  role: string
  status: string
}

const roleLabels: Record<string, string> = {
  student: "طالب",
  instructor: "مدرب",
  admin: "مسؤول",
  super_admin: "مدير عام",
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { showToast } = useStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "10")
      if (search) params.set("search", search)
      if (roleFilter !== "all") params.set("role", roleFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "فشل تحميل البيانات")
      setUsers(data.users || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter, statusFilter, search])

  const updateUserStatus = useCallback(
    async (userId: number, newStatus: string) => {
      setUpdatingId(userId)
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        const data = await res.json()
        if (!res.ok) { throw new Error(data.error || "فشل تحديث الحالة") }
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        )
        const statusLabels: Record<string, string> = {
          active: "نشط",
          blocked: "محظور",
          pending: "قيد الانتظار",
        }
        showToast(`تم تحديث الحالة إلى ${statusLabels[newStatus] ?? newStatus}`)
      } catch (e) {
        showToast(e instanceof Error ? e.message : "حدث خطأ", "error")
      } finally {
        setUpdatingId(null)
      }
    },
    [showToast]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    const t = setTimeout(() => {
      if (page === 1) fetchUsers()
      else setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "المستخدم",
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
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "الدور",
      cell: (row) => roleLabels[row.role] ?? row.role,
    },
    {
      key: "status",
      header: "الحالة",
      cell: (row) => (
        <StatusBadge status={getUserStatusBadge(row.status)}>
          {row.status === "active" ? "نشط" : row.status === "blocked" ? "محظور" : "قيد الانتظار"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      cell: (row) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem
              onClick={() => router.push(`/admin/users/${row.id}/details`)}
            >
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/chat?studentId=${row.id}`)}>
              إرسال رسالة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateUserStatus(row.id, "active")}
              disabled={updatingId === row.id || row.status === "active"}
            >
              <UserCheck className="w-4 h-4" />
              تعيين كنشط
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateUserStatus(row.id, "blocked")}
              disabled={updatingId === row.id || row.status === "blocked"}
            >
              <UserX className="w-4 h-4" />
              تعيين كمحظور
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateUserStatus(row.id, "pending")}
              disabled={updatingId === row.id || row.status === "pending"}
            >
              <Clock className="w-4 h-4" />
              تعيين كقيد الانتظار
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const filters: FilterItem[] = [
    {
      key: "role",
      label: "الدور",
      options: [
        { value: "all", label: "الكل" },
        { value: "student", label: "طالب" },
        { value: "instructor", label: "مدرب" },
        { value: "admin", label: "مسؤول" },
      ],
      value: roleFilter,
      onChange: (v) => {
        setRoleFilter(v)
        setPage(1)
      },
    },
    {
      key: "status",
      label: "الحالة",
      options: [
        { value: "all", label: "الكل" },
        { value: "active", label: "نشط" },
        { value: "blocked", label: "محظور" },
        { value: "pending", label: "قيد الانتظار" },
      ],
      value: statusFilter,
      onChange: (v) => {
        setStatusFilter(v)
        setPage(1)
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">إدارة المستخدمين</h2>
        <Link href="/admin/users/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة مستخدم
          </Button>
        </Link>
      </div>

      <DataTable<User>
        columns={columns}
        data={users}
        isLoading={loading}
        error={error}
        onRetry={fetchUsers}
        searchPlaceholder="بحث بالاسم أو البريد..."
        onSearch={setSearch}
        searchValue={search}
        filters={filters}
        emptyState={{
          icon: "users",
          title: "لا يوجد مستخدمون",
          description: "لم يتم العثور على مستخدمين. أضف مستخدماً جديداً للبدء.",
          action: {
            label: "إضافة مستخدم",
            onClick: () => (window.location.href = "/admin/users/new"),
          },
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
