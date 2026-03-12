"use client"

import { useEffect, useState } from "react"
import { DataTable, type Column } from "@/components/ui/data-table"
import { StatusBadge, getPaymentStatusBadge } from "@/components/ui/status-badge"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface Payment {
  id: number
  amount: number
  status: string
  createdAt: string
  user?: { name: string; email: string }
  course?: { titleAr: string }
}

const statusLabels: Record<string, string> = {
  completed: "مكتمل",
  pending: "قيد الانتظار",
  failed: "فشل",
  refunded: "مسترد",
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/payments?page=${page}&limit=10`)
        const data = await res.json()
        setPayments(data.payments || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } catch {
        setPayments([])
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [page])

  const columns: Column<Payment>[] = [
    {
      key: "user",
      header: "المستخدم",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.user?.email ?? ""}</p>
        </div>
      ),
    },
    {
      key: "course",
      header: "الدورة",
      cell: (row) => row.course?.titleAr ?? "—",
    },
    {
      key: "amount",
      header: "المبلغ",
      cell: (row) => `${row.amount.toLocaleString("ar-SA")} ريال`,
    },
    {
      key: "status",
      header: "الحالة",
      cell: (row) => (
        <StatusBadge status={getPaymentStatusBadge(row.status)}>
          {statusLabels[row.status] ?? row.status}
        </StatusBadge>
      ),
    },
    {
      key: "date",
      header: "التاريخ",
      cell: (row) =>
        format(new Date(row.createdAt), "dd MMM yyyy", { locale: ar }),
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">المدفوعات</h2>

      <DataTable<Payment>
        columns={columns}
        data={payments}
        isLoading={loading}
        emptyState={{
          icon: "payments",
          title: "لا توجد مدفوعات",
          description: "لم يتم تسجيل أي مدفوعات بعد.",
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
