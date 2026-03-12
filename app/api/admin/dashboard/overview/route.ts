import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { subMonths } from "date-fns"

export async function GET() {
  try {
    const now = new Date()
    const lastMonth = subMonths(now, 1)

    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      lastMonthUsers,
      lastMonthCourses,
      lastMonthEnrollments,
      lastMonthRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "published" } }),
      prisma.enrollment.count(),
      prisma.payment
        .aggregate({
          where: { status: "completed" },
          _sum: { amount: true },
        })
        .then((r) => r._sum.amount ?? 0),
      prisma.user.count({
        where: { createdAt: { lte: lastMonth } },
      }),
      prisma.course.count({
        where: { status: "published", updatedAt: { lte: lastMonth } },
      }),
      prisma.enrollment.count({
        where: { purchasedAt: { lte: lastMonth } },
      }),
      prisma.payment
        .aggregate({
          where: {
            status: "completed",
            createdAt: { lte: lastMonth },
          },
          _sum: { amount: true },
        })
        .then((r) => r._sum.amount ?? 0),
    ])

    const calcGrowth = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalSubscriptions: totalEnrollments,
      totalRevenue,
      usersGrowth: calcGrowth(totalUsers, lastMonthUsers),
      coursesGrowth: calcGrowth(totalCourses, lastMonthCourses),
      subscriptionsGrowth: calcGrowth(totalEnrollments, lastMonthEnrollments),
      revenueGrowth: calcGrowth(totalRevenue, lastMonthRevenue),
    })
  } catch (error) {
    console.error("Dashboard overview error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
