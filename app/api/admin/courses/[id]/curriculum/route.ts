import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncCourseCurriculumCounts } from "@/lib/curriculum"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const sections = await prisma.coursesection.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        courselesson: {
          orderBy: { order: "asc" },
          include: { attachments: true },
        },
      },
    })

    const sectionsWithLessons = sections.map((s) => ({
      ...s,
      lessons: s.courselesson,
      courselesson: undefined,
    }))
    const totalLessons = sections.reduce((sum, s) => sum + s.courselesson.length, 0)
    const totalSections = sections.length

    return NextResponse.json({
      sections: sectionsWithLessons,
      counts: { lessons: totalLessons, sections: totalSections },
    })
  } catch (error) {
    console.error("Curriculum API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const courseId = parseInt(id, 10)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { titleAr, titleEn, order = 0 } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json(
        { error: "titleAr and titleEn required" },
        { status: 400 }
      )
    }

    const section = await prisma.coursesection.create({
      data: {
        courseId,
        titleAr,
        titleEn,
        order: parseInt(String(order), 10) || 0,
      },
    })

    await syncCourseCurriculumCounts(courseId)
    return NextResponse.json({ section })
  } catch (error) {
    console.error("Create section error", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
