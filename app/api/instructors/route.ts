import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [instructors, enrollments] = await Promise.all([
      prisma.instructor.findMany({
        orderBy: { id: "asc" },
      }),
      prisma.enrollment.findMany({
        include: {
          course: {
            select: {
              id: true,
              instructorAr: true,
              instructorEn: true,
            },
          },
        },
      }),
    ])

    const aggregates = new Map<string, { courseIds: Set<number>; userIds: Set<number> }>()

    for (const enrollment of enrollments) {
      const { course, userId } = enrollment
      if (!course) continue

      const key = `${course.instructorAr}|||${course.instructorEn}`
      const current =
        aggregates.get(key) ??
        {
          courseIds: new Set<number>(),
          userIds: new Set<number>(),
        }

      current.courseIds.add(course.id)
      current.userIds.add(userId)
      aggregates.set(key, current)
    }

    const payload = instructors.map((instructor: {
      id: number
      nameAr: string
      nameEn: string
      titleAr: string
      titleEn: string
      avatarUrl: string
      coursesCount: number
      studentsCount: number
      rating: number
    }) => {
      const key = `${instructor.nameAr}|||${instructor.nameEn}`
      const agg = aggregates.get(key)

      const coursesFromEnrollments = agg ? agg.courseIds.size : 0
      const studentsFromEnrollments = agg ? agg.userIds.size : 0

      return {
        id: instructor.id,
        nameAr: instructor.nameAr,
        nameEn: instructor.nameEn,
        titleAr: instructor.titleAr,
        titleEn: instructor.titleEn,
        avatar: instructor.avatarUrl,
        // If there is real activity, use it; otherwise fall back to seeded counts
        courses: coursesFromEnrollments > 0 ? coursesFromEnrollments : instructor.coursesCount,
        students: studentsFromEnrollments > 0 ? studentsFromEnrollments : instructor.studentsCount,
        rating: instructor.rating,
      }
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error("[INSTRUCTORS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


