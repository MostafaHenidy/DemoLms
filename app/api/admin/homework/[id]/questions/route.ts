import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const homeworkId = parseInt((await params).id, 10)
    if (isNaN(homeworkId)) {
      return NextResponse.json({ error: "Invalid homework ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      type,
      questionTextAr,
      questionTextEn,
      options,
      correctAnswer,
      points,
      order,
    } = body

    if (!type || !questionTextAr || !questionTextEn) {
      return NextResponse.json(
        { error: "type, questionTextAr, questionTextEn required" },
        { status: 400 }
      )
    }

    const validTypes = ["mcq", "true_false", "text", "file"]
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid question type" }, { status: 400 })
    }

    const maxOrder = await prisma.homeworkquestion.findFirst({
      where: { homeworkId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const q = await prisma.homeworkquestion.create({
      data: {
        homeworkId,
        type,
        questionTextAr,
        questionTextEn,
        options: options ? JSON.stringify(options) : null,
        correctAnswer: correctAnswer ?? null,
        points: points != null ? parseInt(String(points), 10) : 1,
        order: order != null ? parseInt(String(order), 10) : (maxOrder?.order ?? 0) + 1,
      },
    })

    return NextResponse.json({ question: q })
  } catch (error) {
    console.error("Homework question create error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
