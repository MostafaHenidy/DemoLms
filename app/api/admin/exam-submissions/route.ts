import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("examId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (examId) {
      const eid = parseInt(examId, 10)
      if (!isNaN(eid)) where.examId = eid
    }
    if (status) where.status = status

    const submissions = await prisma.examsubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        exam: { select: { titleAr: true, titleEn: true } },
        user: { select: { id: true, name: true, email: true } },
        answers: {
          include: {
            examquestion: {
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
    console.error("Exam submissions API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
