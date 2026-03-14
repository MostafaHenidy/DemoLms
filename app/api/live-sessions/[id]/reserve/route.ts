import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** Reserve a seat (student). Body: { userId } */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id, 10)
    if (isNaN(sessionId)) return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    const body = await request.json()
    const userId = body.userId != null ? parseInt(String(body.userId), 10) : NaN
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const session = await prisma.livesession.findUnique({
      where: { id: sessionId },
      include: { _count: { select: { bookings: true } } },
    })
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
    if (session.scheduledAt < new Date()) {
      return NextResponse.json({ error: "Session has already started or ended" }, { status: 400 })
    }
    if (session._count.bookings >= session.maxSeats) {
      return NextResponse.json({ error: "No seats left" }, { status: 400 })
    }

    await prisma.livesessionbooking.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      create: { sessionId, userId },
      update: {},
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reserve seat error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** Cancel reservation. Body: { userId } */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionId = parseInt(id, 10)
    if (isNaN(sessionId)) return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    const body = await request.json().catch(() => ({}))
    const userId = body.userId != null ? parseInt(String(body.userId), 10) : NaN
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    await prisma.livesessionbooking.deleteMany({
      where: { sessionId, userId },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel reservation error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
