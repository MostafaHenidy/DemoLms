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
      select: { purchasedAt: true },
    })

    // Build counts per weekday (Sun..Sat)
    const counts = new Array(7).fill(0)
    for (const e of enrollments) {
      const day = e.purchasedAt.getDay() // 0=Sun..6=Sat
      counts[day] += 1
    }

    return NextResponse.json({ counts }, { status: 200 })
  } catch (error) {
    console.error("Activity API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

