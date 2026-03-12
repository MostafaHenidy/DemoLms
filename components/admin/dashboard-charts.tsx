"use client"

import React from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export interface ChartData {
  usersGrowth: { month: string; users: number }[]
  revenue: { month: string; revenue: number }[]
  enrollmentsByMonth?: { month: string; enrollments: number }[]
  courseCompletion: { name: string; value: number; color: string }[]
  recentPayments?: {
    id: number
    amount: number
    userName: string | null
    userEmail: string | null
    itemName: string | null
    createdAt: string
  }[]
}

interface DashboardChartsProps {
  data: ChartData | null
  loading?: boolean
}

export function DashboardCharts({ data, loading = false }: DashboardChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border/50 md:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[120px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const usersData = data?.usersGrowth ?? []
  const revenueData = data?.revenue ?? []
  const enrollmentsData = data?.enrollmentsByMonth ?? []
  const completionData = data?.courseCompletion ?? []
  const recentPayments = data?.recentPayments ?? []

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">نمو المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usersData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#usersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">الإيرادات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">الاشتراكات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">توزيع التسجيلات حسب الدورة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            {completionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name.length > 15 ? name.slice(0, 15) + "…" : name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                لا توجد بيانات
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">آخر المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">المستخدم</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">الدورة</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">المبلغ</th>
                    <th className="text-start py-3 px-2 font-medium text-muted-foreground">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-2.5 px-2">
                        <span className="font-medium">{p.userName || p.userEmail || "—"}</span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">{p.itemName || "—"}</td>
                      <td className="py-2.5 px-2 font-medium">{p.amount.toLocaleString("ar-SA")} ريال</td>
                      <td className="py-2.5 px-2 text-muted-foreground">
                        {format(new Date(p.createdAt), "d MMM yyyy", { locale: ar })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
              لا توجد مدفوعات حديثة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
