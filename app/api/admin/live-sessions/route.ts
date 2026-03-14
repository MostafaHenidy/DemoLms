import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { createLiveMeeting } from "@/lib/live-meeting"

async function getAdminOrTeacherId(): Promise<{ userId?: number; adminId?: number } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("adminAccessToken")?.value
  if (!token) return null
  const [prefix, idStr] = token.split("-")
  const id = parseInt(idStr, 10)
  if (!id || isNaN(id)) return null
  if (prefix === "admin") return { adminId: id }
  if (prefix === "user") return { userId: id }
  return null
}

export async function GET() {
  try {
    const auth = await getAdminOrTeacherId()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const sessions = await prisma.livesession.findMany({
      orderBy: { scheduledAt: "asc" },
      include: {
        course: { select: { id: true, titleAr: true, titleEn: true } },
        createdBy: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
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
      meetingUrl: s.meetingUrl,
      courseId: s.courseId,
      course: s.course,
      createdBy: s.createdBy
        ? { id: s.createdBy.id, name: s.createdBy.name }
        : s.createdByAdmin
          ? { id: s.createdByAdmin.id, name: s.createdByAdmin.name }
          : null,
      bookingsCount: s._count.bookings,
      noRecording: s.noRecording,
    }))
    return NextResponse.json({ sessions: list })
  } catch (error) {
    console.error("Live sessions list error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAdminOrTeacherId()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const {
      titleAr,
      titleEn,
      scheduledAt,
      durationMinutes = 60,
      maxSeats = 50,
      provider,
      courseId,
    } = body

    if (!titleAr || !titleEn || !scheduledAt || !provider) {
      return NextResponse.json(
        { error: "titleAr, titleEn, scheduledAt, provider required" },
        { status: 400 }
      )
    }
    if (!["zoom", "google_meet"].includes(provider)) {
      return NextResponse.json({ error: "provider must be zoom or google_meet" }, { status: 400 })
    }

    const startTime = new Date(scheduledAt)
    if (isNaN(startTime.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 })
    }

    const meeting = await createLiveMeeting(provider, {
      title: titleAr,
      startTime,
      durationMinutes: Number(durationMinutes) || 60,
    })

    const session = await prisma.livesession.create({
      data: {
        titleAr: String(titleAr).trim(),
        titleEn: String(titleEn).trim(),
        scheduledAt: startTime,
        durationMinutes: Number(durationMinutes) || 60,
        maxSeats: Math.max(1, Number(maxSeats) || 50),
        provider,
        meetingId: meeting.meetingId,
        meetingUrl: meeting.meetingUrl,
        meetingPassword: meeting.meetingPassword,
        courseId: courseId != null && courseId !== "" ? parseInt(String(courseId), 10) : null,
        createdByUserId: auth.userId ?? null,
        createdByAdminId: auth.adminId ?? null,
        noRecording: true,
      },
      include: {
        course: { select: { id: true, titleAr: true } },
        _count: { select: { bookings: true } },
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Live session create error", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
