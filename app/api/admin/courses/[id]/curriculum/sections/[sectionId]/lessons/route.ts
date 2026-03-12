import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncCourseCurriculumCounts } from "@/lib/curriculum"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const sectionIdNum = parseInt(sectionId, 10)
    if (isNaN(sectionIdNum)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const body = await request.json()
    const { titleAr, titleEn, duration, order = 0, videoUrl, videoPath, examId, homeworkDescription } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json(
        { error: "titleAr and titleEn required" },
        { status: 400 }
      )
    }

    const lesson = await prisma.courselesson.create({
      data: {
        sectionId: sectionIdNum,
        titleAr,
        titleEn,
        duration: duration || null,
        order: parseInt(String(order), 10) || 0,
        videoUrl: videoUrl || null,
        videoPath: videoPath || null,
        examId: examId ? parseInt(String(examId), 10) : null,
        homeworkDescription: homeworkDescription || null,
      },
      include: { section: { select: { courseId: true } } },
    })

    await syncCourseCurriculumCounts(lesson.coursesection.courseId)
    return NextResponse.json({ lesson })
  } catch (error) {
    console.error("Create lesson error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
