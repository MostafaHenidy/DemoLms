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
  gateway?: string | null
  couponCode?: string | null
  discountAmount?: number | null
  transactionId?: string | null
  user?: { name: string; email: string }
  course?: { titleAr: string }
}

const statusLabels: Record<string, string> = {
  completed: "مكتمل",
  pending: "قيد الانتظار",
  failed: "فشل",
  refunded: "مسترد",
}

const gatewayLabels: Record<string, string> = {
  cart: "سلة الشراء",
  stripe: "Stripe",
  moyasar: "Moyasar",
  tamara: "Tamara",
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [gatewayFilter, setGatewayFilter] = useState<string>("")

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page), limit: "10" })
        if (gatewayFilter) params.set("gateway", gatewayFilter)
        const res = await fetch(`/api/admin/payments?${params}`)
        if (res.status === 401) {
          setPayments([])
          setTotalPages(1)
          return
        }
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
  }, [page, gatewayFilter])

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
      cell: (row) => (
        <div>
          <span>{row.amount.toLocaleString("ar-SA")} ريال</span>
          {row.discountAmount != null && row.discountAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              خصم: {row.discountAmount.toLocaleString("ar-SA")} ريال
            </p>
          )}
        </div>
      ),
    },
    {
      key: "gateway",
      header: "بوابة الدفع",
      cell: (row) =>
        row.gateway ? gatewayLabels[row.gateway] ?? row.gateway : "—",
    },
    {
      key: "coupon",
      header: "كود الخصم",
      cell: (row) => row.couponCode ?? "—",
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
        format(new Date(row.createdAt), "dd MMM yyyy HH:mm", { locale: ar }),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-foreground">المدفوعات</h2>
        <select
          value={gatewayFilter}
          onChange={(e) => {
            setGatewayFilter(e.target.value)
            setPage(1)
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">كل بوابات الدفع</option>
          <option value="cart">سلة الشراء</option>
          <option value="stripe">Stripe</option>
          <option value="moyasar">Moyasar</option>
          <option value="tamara">Tamara</option>
        </select>
      </div>

      <DataTable<Payment>
        columns={columns}
        data={payments}
        isLoading={loading}
        emptyState={{
          icon: "payments",
          title: "لا توجد مدفوعات",
          description: "جميع المدفوعات (الاشتراكات مع كوبون أو عبر بوابات الدفع) تظهر هنا.",
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
