import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { subMonths, format } from "date-fns"
import { ar } from "date-fns/locale"

export async function GET() {
  try {
    const now = new Date()
    const months = 6

    const usersByMonth: { month: string; users: number }[] = []
    const revenueByMonth: { month: string; revenue: number }[] = []
    const enrollmentsByMonth: { month: string; enrollments: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const start = subMonths(now, i + 1)
      const end = subMonths(now, i)

      const [users, revenue, enrollments] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: start, lt: end } },
        }),
        prisma.payment
          .aggregate({
            where: {
              status: "completed",
              createdAt: { gte: start, lt: end },
            },
            _sum: { amount: true },
          })
          .then((r) => r._sum.amount ?? 0),
        prisma.enrollment.count({
          where: { purchasedAt: { gte: start, lt: end } },
        }),
      ])

      usersByMonth.push({
        month: format(end, "MMM yyyy", { locale: ar }),
        users,
      })
      revenueByMonth.push({
        month: format(end, "MMM yyyy", { locale: ar }),
        revenue,
      })
      enrollmentsByMonth.push({
        month: format(end, "MMM yyyy", { locale: ar }),
        enrollments,
      })
    }

    const coursesWithEnrollments = await prisma.course.findMany({
      where: { status: "published" },
      select: {
        id: true,
        titleAr: true,
        students: true,
        _count: { select: { enrollment: true } },
      },
      take: 5,
      orderBy: { students: "desc" },
    })

    const courseCompletion = coursesWithEnrollments.map((c, i) => ({
      name: c.titleAr,
      value: c._count.enrollment || c.students,
      color: ["#2563EB", "#0EA5E9", "#10b981", "#f59e0b", "#ef4444"][i] ?? "#2563EB",
    }))

    const recentPayments = await prisma.payment.findMany({
      where: { status: "completed" },
      select: {
        id: true,
        amount: true,
        userName: true,
        userEmail: true,
        itemName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    })

    return NextResponse.json({
      usersGrowth: usersByMonth,
      revenue: revenueByMonth,
      enrollmentsByMonth,
      courseCompletion,
      recentPayments: recentPayments.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Dashboard charts error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
