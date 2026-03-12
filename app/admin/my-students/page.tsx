"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
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

interface Student {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  role: string
  status: string
}

export default function MyStudentsPage() {
  const user = getAdminUser()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/enrollments?instructorId=${user.id}`)
        const data = await res.json()
        let list = data.students || []

        if (search) {
          const q = search.toLowerCase()
          list = list.filter(
            (u: Student) =>
              u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
          )
        }

        setStudents(list)
        setTotalPages(1)
      } catch {
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id, search])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">طلابي</h2>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input
              placeholder="بحث بالاسم أو البريد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-[#94A3B8]">
              لا يوجد طلاب مسجلين في دوراتك.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full">
                          <Image
                            src={s.avatarUrl || "/user-avatar.png"}
                            alt={s.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#94A3B8]">{s.email}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {s.status === "active" ? "نشط" : s.status || "—"}
                      </span>
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
