import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Student homework submission API.
 * In production, userId should come from auth session.
 * Body: { userId: number, answers: { questionId: number, textAnswer?: string, filePath?: string, selectedAnswer?: string }[] }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ homeworkId: string }> }
) {
  try {
    const homeworkId = parseInt((await params).homeworkId, 10)
    if (isNaN(homeworkId)) {
      return NextResponse.json({ error: "Invalid homework ID" }, { status: 400 })
    }

    const body = await request.json()
    const { userId, answers } = body

    if (!userId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "userId and answers array required" },
        { status: 400 }
      )
    }

    const homework = await prisma.homework.findUnique({
      where: { id: homeworkId },
      include: { questions: true },
    })

    if (!homework) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 })
    }

    const maxScore = homework.questions.reduce((sum, q) => sum + q.points, 0)

    const submission = await prisma.homeworksubmission.create({
      data: {
        homeworkId,
        userId: parseInt(String(userId), 10),
        status: "submitted",
        maxScore,
        answers: {
          create: answers.map((a: { questionId: number; textAnswer?: string; filePath?: string; selectedAnswer?: string }) => ({
            questionId: a.questionId,
            textAnswer: a.textAnswer ?? null,
            filePath: a.filePath ?? null,
            selectedAnswer: a.selectedAnswer ?? null,
          })),
        },
      },
      include: {
        homework: { select: { titleAr: true } },
        answers: true,
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Homework submit error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
