import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get("instructorId")

    if (!instructorId) {
      return NextResponse.json({ error: "instructorId required" }, { status: 400 })
    }

    const id = parseInt(instructorId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid instructorId" }, { status: 400 })
    }

    const courses = await prisma.course.findMany({
      where: { instructorId: id },
      select: { id: true },
    })
    const courseIds = courses.map((c) => c.id)

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true, status: true } },
        course: { select: { id: true, titleAr: true } },
      },
    })

    const uniqueUsers = Array.from(
      new Map(enrollments.map((e) => [e.userId, e.user])).values()
    )

    return NextResponse.json({
      enrollments,
      students: uniqueUsers,
    })
  } catch (error) {
    console.error("Enrollments API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
