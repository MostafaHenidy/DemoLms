import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100)
    const instructorId = searchParams.get("instructorId")
    const categoryId = searchParams.get("categoryId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")?.trim()

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (instructorId) {
      const id = parseInt(instructorId, 10)
      if (!isNaN(id)) {
        where.instructorId = id
      }
    }

    if (status) {
      where.status = status
    }

    if (categoryId) {
      const cid = parseInt(categoryId, 10)
      if (!isNaN(cid)) {
        where.categoryId = cid
      } else {
        where.category = categoryId
      }
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
      ]
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      courses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Courses API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      titleAr,
      titleEn,
      instructorId,
      price = 0,
      originalPrice,
      category,
      categoryId,
      level,
      hours = 0,
      lessons = 0,
      sections = 0,
      status = "published",
      isFeatured = false,
      coverImageUrl,
    } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json({ error: "Title required" }, { status: 400 })
    }

    let catSlug = category || "general"
    let catId: number | null = null
    if (categoryId != null) {
      const cid = parseInt(String(categoryId), 10)
      if (!isNaN(cid)) {
        const cat = await prisma.category.findUnique({ where: { id: cid } })
        if (cat) {
          catSlug = cat.slug
          catId = cat.id
        }
      }
    }

    const slug =
      titleEn.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()

    const course = await prisma.course.create({
      data: {
        slug,
        titleAr,
        titleEn,
        instructorAr: "",
        instructorEn: "",
        instructorId: instructorId ? parseInt(instructorId, 10) : null,
        rating: 0,
        students: 0,
        price: parseInt(String(price), 10) || 0,
        originalPrice: parseInt(String(originalPrice || price), 10) || 0,
        category: catSlug,
        categoryId: catId,
        level: level || "beginner",
        hours: parseInt(String(hours), 10) || 0,
        lessons: parseInt(String(lessons), 10) || 0,
        sections: parseInt(String(sections), 10) || 0,
        status: status || "published",
        isFeatured: !!isFeatured,
        coverImageUrl: coverImageUrl || null,
      },
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Create course error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
