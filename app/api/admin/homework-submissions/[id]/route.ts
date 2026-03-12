import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const submission = await prisma.homeworksubmission.findUnique({
      where: { id },
      include: {
        homework: { include: { questions: { orderBy: { order: "asc" } } } },
        user: { select: { id: true, name: true, email: true } },
        answers: {
          include: {
            homeworkquestion: true,
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Homework submission GET error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const { totalScore, feedback, status, answers } = body

    const updateData: Record<string, unknown> = {}
    if (totalScore !== undefined) updateData.totalScore = parseInt(String(totalScore), 10)
    if (feedback !== undefined) updateData.feedback = feedback
    if (status !== undefined) updateData.status = status
    updateData.gradedAt = new Date()

    if (answers && Array.isArray(answers)) {
      for (const a of answers) {
        if (a.id && (a.score !== undefined || a.feedback !== undefined)) {
          const ansUpdate: Record<string, unknown> = {}
          if (a.score !== undefined) ansUpdate.score = parseInt(String(a.score), 10)
          if (a.feedback !== undefined) ansUpdate.feedback = a.feedback
          await prisma.homeworksubmissionanswer.update({
            where: { id: a.id },
            data: ansUpdate,
          })
        }
      }
    }

    const submission = await prisma.homeworksubmission.update({
      where: { id },
      data: updateData,
      include: {
        homework: true,
        user: { select: { id: true, name: true, email: true } },
        answers: { include: { homeworkquestion: true } },
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Homework submission PATCH error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
