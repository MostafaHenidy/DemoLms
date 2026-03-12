import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Course API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
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
    const {
      titleAr,
      titleEn,
      price,
      originalPrice,
      category,
      categoryId,
      level,
      hours,
      lessons,
      sections,
      status,
      isFeatured,
      coverImageUrl,
    } = body

    const updateData: Record<string, unknown> = {}
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (price !== undefined) updateData.price = parseInt(String(price), 10)
    if (originalPrice !== undefined) updateData.originalPrice = parseInt(String(originalPrice), 10)
    if (category !== undefined) updateData.category = category
    if (categoryId !== undefined) {
      if (categoryId === null || categoryId === "") {
        updateData.categoryId = null
        updateData.category = "general"
      } else {
        const cid = parseInt(String(categoryId), 10)
        if (!isNaN(cid)) {
          const cat = await prisma.category.findUnique({ where: { id: cid } })
          if (cat) {
            updateData.categoryId = cat.id
            updateData.category = cat.slug
          }
        }
      }
    }
    if (level !== undefined) updateData.level = level
    if (hours !== undefined) updateData.hours = parseInt(String(hours), 10)
    if (lessons !== undefined) updateData.lessons = parseInt(String(lessons), 10)
    if (sections !== undefined) updateData.sections = parseInt(String(sections), 10)
    if (status !== undefined) updateData.status = status
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl || null

    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Update course error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
