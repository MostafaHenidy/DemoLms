import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const where: Record<string, unknown> = {}
    if (courseId) {
      const cid = parseInt(courseId, 10)
      if (!isNaN(cid)) where.courseId = cid
    }

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
      },
    })

    return NextResponse.json({ exams })
  } catch (error) {
    console.error("Exams API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { titleAr, titleEn, courseId } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json({ error: "titleAr and titleEn required" }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        titleAr,
        titleEn,
        courseId: courseId ? parseInt(String(courseId), 10) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ exam })
  } catch (error) {
    console.error("Create exam error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
