import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncCourseCurriculumCounts } from "@/lib/curriculum"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const id = parseInt(lessonId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
    }

    const body = await request.json()
    const { titleAr, titleEn, duration, order, videoUrl, videoPath, examId, homeworkId } = body

    const updateData: Record<string, unknown> = {}
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (duration !== undefined) updateData.duration = duration
    if (order !== undefined) updateData.order = parseInt(String(order), 10)
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl || null
    if (videoPath !== undefined) updateData.videoPath = videoPath || null
    if (examId !== undefined) updateData.examId = examId ? parseInt(String(examId), 10) : null
    if (homeworkId !== undefined) updateData.homeworkId = homeworkId ? parseInt(String(homeworkId), 10) : null

    const lesson = await prisma.courselesson.update({
      where: { id },
      data: updateData,
      include: { coursesection: { select: { courseId: true } } },
    })

    await syncCourseCurriculumCounts(lesson.coursesection.courseId)
    return NextResponse.json({ lesson })
  } catch (error) {
    console.error("Update lesson error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const id = parseInt(lessonId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
    }

    const lesson = await prisma.courselesson.findUnique({
      where: { id },
      include: { coursesection: { select: { courseId: true } } },
    })
    await prisma.courselesson.delete({ where: { id } })
    if (lesson) await syncCourseCurriculumCounts(lesson.coursesection.courseId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete lesson error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
