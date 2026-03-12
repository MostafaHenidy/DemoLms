import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const homework = await prisma.homework.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
      },
    })

    if (!homework) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 })
    }

    return NextResponse.json({ homework })
  } catch (error) {
    console.error("Homework GET error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { titleAr, titleEn, courseId } = body

    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (courseId !== undefined) updateData.courseId = courseId ? parseInt(String(courseId), 10) : null

    const homework = await prisma.homework.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ homework })
  } catch (error) {
    console.error("Homework PATCH error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    await prisma.homework.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Homework DELETE error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
