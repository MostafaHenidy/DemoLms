import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAdminOrTeacherId()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    const session = await prisma.livesession.findUnique({
      where: { id: idNum },
      include: {
        course: { select: { id: true, titleAr: true, titleEn: true } },
        createdBy: { select: { id: true, name: true } },
        createdByAdmin: { select: { id: true, name: true } },
        bookings: { include: { user: { select: { id: true, name: true, email: true } } },
      },
    })
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
    return NextResponse.json({ session })
  } catch (error) {
    console.error("Live session get error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAdminOrTeacherId()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    const body = await request.json()
    const { titleAr, titleEn, scheduledAt, durationMinutes, maxSeats } = body
    const updateData: Record<string, unknown> = {}
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt)
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes
    if (maxSeats !== undefined) updateData.maxSeats = maxSeats
    const session = await prisma.livesession.update({
      where: { id: idNum },
      data: updateData,
    })
    return NextResponse.json({ session })
  } catch (error) {
    console.error("Live session update error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAdminOrTeacherId()
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    await prisma.livesession.delete({ where: { id: idNum } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Live session delete error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
