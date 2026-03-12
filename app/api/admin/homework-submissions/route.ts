import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const homeworkId = searchParams.get("homeworkId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (homeworkId) {
      const hid = parseInt(homeworkId, 10)
      if (!isNaN(hid)) where.homeworkId = hid
    }
    if (status) where.status = status

    const submissions = await prisma.homeworksubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        homework: { select: { titleAr: true, titleEn: true } },
        user: { select: { id: true, name: true, email: true } },
        answers: {
          include: {
            homeworkquestion: {
              select: {
                id: true,
                type: true,
                questionTextAr: true,
                questionTextEn: true,
                points: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Homework submissions API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
