"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InstructorOverviewCards } from "@/components/admin/instructor-overview-cards"
import { OverviewCards, type AdminOverviewData } from "@/components/admin/overview-cards"
import { DashboardCharts, type ChartData } from "@/components/admin/dashboard-charts"
import { getAdminUser, isAdmin } from "@/lib/admin-auth"

export default function AdminDashboardPage() {
  const user = getAdminUser()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [adminOverview, setAdminOverview] = useState<AdminOverviewData | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [instructorStats, setInstructorStats] = useState({
    studentsCount: 0,
    coursesCount: 0,
    subscriptionsCount: 0,
    totalSales: 0,
  })

  const fetchAdminData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [overviewRes, chartsRes] = await Promise.all([
        fetch("/api/admin/dashboard/overview"),
        fetch("/api/admin/dashboard/charts"),
      ])
      const overview = await overviewRes.json()
      const charts = await chartsRes.json()
      if (overviewRes.ok) setAdminOverview(overview)
      if (chartsRes.ok) setChartData(charts)
    } catch {
      setAdminOverview(null)
      setChartData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchInstructorData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const instructorId = user?.id
      const [coursesRes, paymentsRes] = await Promise.all([
        fetch(
          `/api/admin/courses?limit=100${instructorId ? `&instructorId=${instructorId}` : ""}`
        ),
        fetch(
          `/api/admin/payments?limit=100${instructorId ? `&instructorId=${instructorId}` : ""}`
        ),
      ])
      const coursesData = await coursesRes.json()
      const paymentsData = await paymentsRes.json()
      const courses = coursesData.courses || []
      const payments = paymentsData.payments || []
      const publishedCourses = courses.filter((c: { status: string }) => c.status === "published")
      const studentsCount = publishedCourses.reduce(
        (sum: number, c: { students: number }) => sum + (c.students || 0),
        0
      )
      const totalSales = payments
        .filter((p: { status: string }) => p.status === "completed")
        .reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0)
      setInstructorStats({
        studentsCount,
        coursesCount: publishedCourses.length,
        subscriptionsCount: studentsCount,
        totalSales,
      })
    } catch {
      setInstructorStats({
        studentsCount: 0,
        coursesCount: 0,
        subscriptionsCount: 0,
        totalSales: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (isAdmin(user)) {
      fetchAdminData(true)
    } else {
      fetchInstructorData(true)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    if (isAdmin(user)) {
      fetchAdminData()
    } else {
      fetchInstructorData()
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">لوحة التحكم</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {isAdmin(user) ? (
        <>
          <OverviewCards data={adminOverview} loading={loading && !refreshing} />
          <DashboardCharts data={chartData} loading={loading && !refreshing} />
        </>
      ) : (
        <InstructorOverviewCards
          studentsCount={instructorStats.studentsCount}
          coursesCount={instructorStats.coursesCount}
          subscriptionsCount={instructorStats.subscriptionsCount}
          totalSales={instructorStats.totalSales}
          loading={loading}
        />
      )}
    </div>
  )
}
