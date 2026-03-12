import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminAccessToken")?.value

    if (!token?.startsWith("user-")) {
      return NextResponse.json({ error: "Instructor only" }, { status: 403 })
    }

    const teacherId = parseInt(token.replace("user-", ""), 10)
    if (isNaN(teacherId)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { startDate, endDate } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate required" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    const attendance = await prisma.attendance.findMany({
      where: {
        teacherId,
        sessionDate: { gte: start, lte: end },
      },
    })

    const sessionsCount = attendance.length
    const uniqueStudents = new Set(attendance.map((a) => a.userId)).size
    const totalRevenue = attendance.reduce((sum, a) => sum + (a.price || 0), 0)

    const settings = await prisma.teacherSalarySettings.findUnique({
      where: { teacherId },
    })

    let teacherShare = 0
    let calculationMethod = "fixed_per_session"

    if (settings) {
      calculationMethod = settings.calculationMethod
      if (settings.calculationMethod === "fixed_per_session" && settings.fixedAmount) {
        teacherShare = sessionsCount * settings.fixedAmount
      } else if (settings.calculationMethod === "percentage" && settings.percentage) {
        teacherShare = Math.round(totalRevenue * (settings.percentage / 100))
      } else if (
        settings.calculationMethod === "fixed_plus_percentage" &&
        settings.fixedBaseAmount !== null &&
        settings.percentageOnTop !== null
      ) {
        teacherShare =
          sessionsCount * settings.fixedBaseAmount +
          Math.round(totalRevenue * (settings.percentageOnTop / 100))
      }
    }

    const centerProfit = totalRevenue - teacherShare

    return NextResponse.json({
      sessionsCount,
      studentsCount: uniqueStudents,
      totalRevenue,
      teacherShare,
      centerProfit,
      calculationMethod,
      period: { startDate, endDate },
    })
  } catch (error) {
    console.error("Calculate salary error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
