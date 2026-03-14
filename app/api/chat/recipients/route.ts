import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

/**
 * GET /api/chat/recipients?userId=1
 * Returns list of admins and teachers (instructors of courses the student is enrolled in) that the student can message.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = parseInt(searchParams.get("userId") ?? "", 10)
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 })
    }

    const prisma = getPrismaClient()

    const [admins, teacherIdsFromEnrollments] = await Promise.all([
      prisma.admin.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true },
      }),
    ])

    const courseIds = teacherIdsFromEnrollments.map((e) => e.courseId)
    const coursesWithInstructor = await prisma.course.findMany({
      where: { id: { in: courseIds }, instructorId: { not: null } },
      select: { instructorId: true },
      distinct: ["instructorId"],
    })
    const instructorIds = coursesWithInstructor.map((c) => c.instructorId).filter(Boolean) as number[]

    const teachers = instructorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: instructorIds } },
          select: { id: true, name: true, email: true },
        })
      : []

    const list = [
      ...admins.map((a) => ({ type: "admin" as const, id: a.id, name: a.name, email: a.email })),
      ...teachers.map((t) => ({ type: "teacher" as const, id: t.id, name: t.name, email: t.email })),
    ]

    return NextResponse.json({ recipients: list })
  } catch (error) {
    console.error("Chat recipients error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
