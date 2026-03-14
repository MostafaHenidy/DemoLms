import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** Get session detail. If userId query param is provided and has a booking, include meetingUrl. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get("userId")
    const userId = userIdParam ? parseInt(userIdParam, 10) : null

    const session = await prisma.livesession.findUnique({
      where: { id: idNum },
      include: {
        course: { select: { id: true, titleAr: true, titleEn: true } },
        _count: { select: { bookings: true } },
      },
    })
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

    let hasBooking = false
    if (userId && !isNaN(userId)) {
      const booking = await prisma.livesessionbooking.findUnique({
        where: { sessionId_userId: { sessionId: idNum, userId } },
      })
      hasBooking = !!booking
    }

    return NextResponse.json({
      session: {
        id: session.id,
        titleAr: session.titleAr,
        titleEn: session.titleEn,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        maxSeats: session.maxSeats,
        provider: session.provider,
        course: session.course,
        bookedCount: session._count.bookings,
        noRecording: session.noRecording,
        hasBooking,
        meetingUrl: hasBooking ? session.meetingUrl : null,
        meetingPassword: hasBooking ? session.meetingPassword : null,
      },
    })
  } catch (error) {
    console.error("Live session detail error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
