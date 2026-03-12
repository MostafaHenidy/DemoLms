import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Student exam submission API.
 * In production, userId should come from auth session.
 * Body: { userId: number, answers: { questionId: number, textAnswer?: string, filePath?: string, selectedAnswer?: string }[] }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const examId = parseInt((await params).examId, 10)
    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    const body = await request.json()
    const { userId, answers } = body

    if (!userId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "userId and answers array required" },
        { status: 400 }
      )
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0)

    const submission = await prisma.examsubmission.create({
      data: {
        examId,
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
        exam: { select: { titleAr: true } },
        answers: true,
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Exam submit error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
