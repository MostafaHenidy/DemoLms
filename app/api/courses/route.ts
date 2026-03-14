import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Public API: list published courses for homepage and catalog.
 * No auth required.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100)
    const search = searchParams.get("search")?.trim()
    const category = searchParams.get("category")?.trim()

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { status: "published" }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
        { instructorAr: { contains: search } },
        { instructorEn: { contains: search } },
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
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    const items = courses.map((c) => ({
      id: String(c.id),
      slug: c.slug,
      titleAr: c.titleAr,
      titleEn: c.titleEn,
      instructorAr: c.instructorAr,
      instructorEn: c.instructorEn,
      instructorAvatar: c.user?.avatarUrl || "/user-avatar.png",
      rating: c.rating,
      students: c.students,
      price: c.price,
      originalPrice: c.originalPrice,
      category: c.category,
      level: c.level,
      hours: c.hours,
      lessons: c.lessons,
      sections: c.sections,
      thumbnail: c.coverImageUrl || "/course-1.png",
      updatedAt: c.updatedAt.toISOString().slice(0, 7),
    }))

    return NextResponse.json({
      courses: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Public courses API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
