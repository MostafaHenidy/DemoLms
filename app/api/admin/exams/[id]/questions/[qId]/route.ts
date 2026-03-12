import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; qId: string }> }
) {
  try {
    const qId = parseInt((await params).qId, 10)
    if (isNaN(qId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
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

    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (questionTextAr !== undefined) updateData.questionTextAr = questionTextAr
    if (questionTextEn !== undefined) updateData.questionTextEn = questionTextEn
    if (options !== undefined) updateData.options = options ? JSON.stringify(options) : null
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer ?? null
    if (points !== undefined) updateData.points = parseInt(String(points), 10)
    if (order !== undefined) updateData.order = parseInt(String(order), 10)

    const q = await prisma.examquestion.update({
      where: { id: qId },
      data: updateData,
    })

    return NextResponse.json({ question: q })
  } catch (error) {
    console.error("Exam question PATCH error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; qId: string }> }
) {
  try {
    const qId = parseInt((await params).qId, 10)
    if (isNaN(qId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 })
    }

    await prisma.examquestion.delete({ where: { id: qId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Exam question DELETE error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
