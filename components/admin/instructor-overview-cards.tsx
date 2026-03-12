"use client"

import React from "react"
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  loading?: boolean
}

function StatCard({ title, value, icon: Icon, loading }: StatCardProps) {
  return (
    <Card className="border-[#E2E8F0]/60 min-w-0 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#94A3B8]">{title}</p>
            <p className="text-2xl font-bold text-[#0F172A] mt-1">
              {loading ? "—" : value}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#2563EB]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface InstructorOverviewCardsProps {
  studentsCount: number
  coursesCount: number
  subscriptionsCount: number
  totalSales: number
  loading?: boolean
}

export function InstructorOverviewCards({
  studentsCount,
  coursesCount,
  subscriptionsCount,
  totalSales,
  loading = false,
}: InstructorOverviewCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
      <StatCard
        title="طلابي"
        value={studentsCount}
        icon={Users}
        loading={loading}
      />
      <StatCard
        title="دوراتي"
        value={coursesCount}
        icon={BookOpen}
        loading={loading}
      />
      <StatCard
        title="إجمالي الاشتراكات"
        value={subscriptionsCount}
        icon={CreditCard}
        loading={loading}
      />
      <StatCard
        title="إجمالي المبيعات"
        value={`${totalSales} ريال`}
        icon={TrendingUp}
        loading={loading}
      />
    </div>
  )
}
