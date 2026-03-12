import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100)
    const instructorId = searchParams.get("instructorId")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (instructorId) {
      const id = parseInt(instructorId, 10)
      if (!isNaN(id)) {
        where.course = { instructorId: id }
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          course: { select: { id: true, titleAr: true, titleEn: true } },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Payments API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
