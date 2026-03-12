import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get("userId")
  const userId = userIdParam ? Number(userIdParam) : NaN

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 })
  }

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            hours: true,
          },
        },
      },
    })

    const enrolledCount = enrollments.length

    // For now, treat all enrollments as completed and certificates as completed courses.
    const completedCount = enrolledCount
    const certificatesCount = completedCount

    const totalHours = enrollments.reduce((sum, e) => {
      return sum + (e.course?.hours ?? 0)
    }, 0)

    return NextResponse.json(
      {
        enrolledCount,
        completedCount,
        totalHours,
        certificatesCount,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Dashboard summary error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

