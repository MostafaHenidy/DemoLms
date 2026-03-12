import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get("teacherId")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100)
    const courseId = searchParams.get("courseId")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (teacherId) {
      const id = parseInt(teacherId, 10)
      if (!isNaN(id)) where.teacherId = id
    }
    if (courseId) {
      const id = parseInt(courseId, 10)
      if (!isNaN(id)) where.courseId = id
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sessionDate: "desc" },
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({
      attendance: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Attendance API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      teacherId,
      courseId,
      userId,
      sessionType = "offline",
      sessionDate,
      sessionTime,
      price,
      paymentStatus = "unpaid",
      paidAmount,
      paymentMethod,
    } = body

    if (!teacherId || !courseId || !userId || !sessionDate) {
      return NextResponse.json(
        { error: "teacherId, courseId, userId, sessionDate required" },
        { status: 400 }
      )
    }

    const record = await prisma.attendance.create({
      data: {
        teacherId: parseInt(String(teacherId), 10),
        courseId: parseInt(String(courseId), 10),
        userId: parseInt(String(userId), 10),
        sessionType: sessionType === "online" ? "online" : "offline",
        sessionDate: new Date(sessionDate),
        sessionTime: sessionTime || null,
        price: price ? parseInt(String(price), 10) : null,
        paymentStatus:
          paymentStatus === "paid"
            ? "paid"
            : paymentStatus === "partial"
              ? "partial"
              : "unpaid",
        paidAmount: paidAmount ? parseInt(String(paidAmount), 10) : null,
        paymentMethod: paymentMethod || null,
      },
    })

    return NextResponse.json({ attendance: record })
  } catch (error) {
    console.error("Attendance create error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
