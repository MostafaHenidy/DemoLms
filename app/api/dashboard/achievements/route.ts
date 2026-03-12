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
    // Aggregate data for simple achievement logic
    const enrolledCount = await prisma.enrollment.count({
      where: { userId },
    })

    // Certificates == completed enrollments for now
    const certificatesCount = enrolledCount

    // Basic streak approximation: number of distinct days with enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { purchasedAt: true },
    })
    const distinctDays = new Set(
      enrollments.map((e) => e.purchasedAt.toISOString().slice(0, 10)),
    )
    const streakDays = distinctDays.size

    const templates = await prisma.achievement.findMany({
      orderBy: { id: "asc" },
    })

    const achievements = templates.map((t) => {
      let earned = false
      if (t.targetCourses && enrolledCount >= t.targetCourses) earned = true
      if (t.targetCertificates && certificatesCount >= t.targetCertificates) earned = true
      if (t.targetStreakDays && streakDays >= t.targetStreakDays) earned = true

      return {
        id: t.id,
        key: t.key,
        titleAr: t.titleAr,
        titleEn: t.titleEn,
        descriptionAr: t.descriptionAr,
        descriptionEn: t.descriptionEn,
        earned,
      }
    })

    return NextResponse.json(
      {
        achievements,
        enrolledCount,
        certificatesCount,
        streakDays,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Achievements API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

