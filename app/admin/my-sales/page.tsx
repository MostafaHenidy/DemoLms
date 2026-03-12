"use client"

import { useEffect, useState } from "react"
import { CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAdminUser } from "@/lib/admin-auth"

interface Payment {
  id: number
  amount: number
  status: string
  userName?: string
  userEmail?: string
  itemName?: string
  createdAt: string
  user?: { name?: string; email?: string }
  course?: { titleAr?: string }
}

export default function MySalesPage() {
  const user = getAdminUser()
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetch(
      `/api/admin/payments?page=${page}&limit=10&instructorId=${user.id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || [])
        const total = (data.payments || [])
          .filter((p: Payment) => p.status === "completed")
          .reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
        setTotalSales(total)
        setTotalPages(data.pagination?.totalPages || 1)
      })
      .catch(() => {
        setPayments([])
        setTotalSales(0)
      })
      .finally(() => setLoading(false))
  }, [user?.id, page])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">مبيعاتي</h2>

      <Card className="max-w-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94A3B8]">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {loading ? "—" : `${totalSales} ريال`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#2563EB]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">سجل المبيعات</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">لا توجد مبيعات</p>
              <p className="text-sm mt-1">لم يتم العثور على مبيعات لدوراتك</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الدورة</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.userName || p.user?.name || "—"}</p>
                        <p className="text-xs text-[#94A3B8]">{p.userEmail || p.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.itemName || p.course?.titleAr || "—"}</TableCell>
                    <TableCell>{p.amount} ريال</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          p.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {p.status === "completed"
                          ? "مكتمل"
                          : p.status === "pending"
                            ? "قيد الانتظار"
                            : "فشل"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#94A3B8]">
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("ar-SA")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                السابق
              </button>
              <span className="flex items-center px-4 text-sm">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
