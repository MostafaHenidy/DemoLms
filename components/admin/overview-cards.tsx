"use client"

import React from "react"
import { Users, BookOpen, CreditCard, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: number; isPositive: boolean }
  loading?: boolean
}

function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  return (
    <Card className="rounded-xl border border-border/50 bg-card min-w-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {loading ? "—" : value}
            </p>
            {trend !== undefined && !loading && (
              <div
                className={`flex items-center gap-1 mt-1 text-xs font-medium ${
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#2563EB]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export interface AdminOverviewData {
  totalUsers: number
  totalCourses: number
  totalSubscriptions: number
  totalRevenue: number
  usersGrowth: number
  coursesGrowth: number
  subscriptionsGrowth: number
  revenueGrowth: number
}

interface OverviewCardsProps {
  data: AdminOverviewData | null
  loading?: boolean
}

export function OverviewCards({ data, loading = false }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
      <StatCard
        title="إجمالي المستخدمين"
        value={data?.totalUsers ?? 0}
        icon={Users}
        trend={
          data?.usersGrowth !== undefined
            ? { value: data.usersGrowth, isPositive: data.usersGrowth >= 0 }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        title="إجمالي الدورات"
        value={data?.totalCourses ?? 0}
        icon={BookOpen}
        trend={
          data?.coursesGrowth !== undefined
            ? { value: data.coursesGrowth, isPositive: data.coursesGrowth >= 0 }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        title="إجمالي الاشتراكات"
        value={data?.totalSubscriptions ?? 0}
        icon={CreditCard}
        trend={
          data?.subscriptionsGrowth !== undefined
            ? {
                value: data.subscriptionsGrowth,
                isPositive: data.subscriptionsGrowth >= 0,
              }
            : undefined
        }
        loading={loading}
      />
      <StatCard
        title="إجمالي الإيرادات"
        value={data ? `${data.totalRevenue.toLocaleString("ar-SA")} ريال` : "0 ريال"}
        icon={TrendingUp}
        trend={
          data?.revenueGrowth !== undefined
            ? { value: data.revenueGrowth, isPositive: data.revenueGrowth >= 0 }
            : undefined
        }
        loading={loading}
      />
    </div>
  )
}
