import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const homeworkDelegate = (prisma as { homework?: { findMany: (args: unknown) => Promise<unknown[]> } }).homework
    if (!homeworkDelegate) {
      return NextResponse.json({ homework: [] })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    const where: Record<string, unknown> = {}
    if (courseId) {
      const cid = parseInt(courseId, 10)
      if (!isNaN(cid)) where.courseId = cid
    }

    const homework = await homeworkDelegate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
      },
    })

    return NextResponse.json({ homework })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    const stack = error instanceof Error ? error.stack : undefined
    console.error("Homework API error", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? message : undefined,
        ...(process.env.NODE_ENV === "development" && stack ? { stack } : {}),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const homeworkDelegate = (prisma as { homework?: { create: (args: unknown) => Promise<unknown> } }).homework
    if (!homeworkDelegate) {
      return NextResponse.json(
        { error: "Homework model not available. Run npx prisma generate and restart the dev server." },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { titleAr, titleEn, courseId } = body

    if (!titleAr || !titleEn) {
      return NextResponse.json({ error: "titleAr and titleEn required" }, { status: 400 })
    }

    const hw = await homeworkDelegate.create({
      data: {
        titleAr,
        titleEn,
        courseId: courseId ? parseInt(String(courseId), 10) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ homework: hw })
  } catch (error) {
    console.error("Create homework error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
