import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** List upcoming live sessions for students (no auth required to list). */
export async function GET() {
  try {
    const now = new Date()
    const sessions = await prisma.livesession.findMany({
      where: { scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      include: {
        course: { select: { id: true, titleAr: true, titleEn: true } },
        _count: { select: { bookings: true } },
      },
    })
    const list = sessions.map((s) => ({
      id: s.id,
      titleAr: s.titleAr,
      titleEn: s.titleEn,
      scheduledAt: s.scheduledAt,
      durationMinutes: s.durationMinutes,
      maxSeats: s.maxSeats,
      provider: s.provider,
      course: s.course,
      bookedCount: s._count.bookings,
      noRecording: s.noRecording,
    }))
    return NextResponse.json({ sessions: list })
  } catch (error) {
    console.error("Live sessions public list error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
