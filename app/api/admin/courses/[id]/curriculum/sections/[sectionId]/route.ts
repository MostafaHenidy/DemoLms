import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncCourseCurriculumCounts } from "@/lib/curriculum"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const id = parseInt(sectionId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const body = await request.json()
    const { titleAr, titleEn, order } = body

    const updateData: Record<string, unknown> = {}
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (order !== undefined) updateData.order = parseInt(String(order), 10)

    const section = await prisma.coursesection.update({
      where: { id },
      data: updateData,
    })

    await syncCourseCurriculumCounts(section.courseId)
    return NextResponse.json({ section })
  } catch (error) {
    console.error("Update section error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { sectionId } = await params
    const id = parseInt(sectionId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    const section = await prisma.coursesection.findUnique({
      where: { id },
      select: { courseId: true },
    })
    await prisma.coursesection.delete({ where: { id } })
    if (section) await syncCourseCurriculumCounts(section.courseId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete section error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
