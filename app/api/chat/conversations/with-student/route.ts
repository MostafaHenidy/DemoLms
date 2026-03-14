import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { getChatActor } from "@/lib/chat-auth"

/**
 * GET /api/chat/conversations/with-student?studentId=123
 * For admin or teacher: get or create a conversation with the given student.
 * Returns the conversation so the chat UI can open it.
 */
export async function GET(request: Request) {
  try {
    const actor = await getChatActor(request)
    if (!actor || actor.type === "student") {
      return NextResponse.json({ error: "Only admin or teacher can use this" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = parseInt(searchParams.get("studentId") ?? "", 10)
    if (!studentId || isNaN(studentId)) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 })
    }

    const prisma = getPrismaClient()

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (actor.type === "admin") {
      let conv = await prisma.chatconversation.findFirst({
        where: {
          studentId,
          counterpartType: "admin",
          counterpartAdminId: actor.adminId,
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
        },
      })
      if (!conv) {
        conv = await prisma.chatconversation.create({
          data: {
            studentId,
            counterpartType: "admin",
            counterpartAdminId: actor.adminId,
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
            messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
          },
        })
      }
      return NextResponse.json({
        conversation: {
          id: conv.id,
          student: conv.student,
          lastMessage: conv.messages[0] ?? null,
          updatedAt: conv.updatedAt,
        },
      })
    }

    if (actor.type === "teacher") {
      let conv = await prisma.chatconversation.findFirst({
        where: {
          studentId,
          counterpartType: "teacher",
          counterpartUserId: actor.userId,
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
        },
      })
      if (!conv) {
        conv = await prisma.chatconversation.create({
          data: {
            studentId,
            counterpartType: "teacher",
            counterpartUserId: actor.userId,
          },
          include: {
            student: { select: { id: true, name: true, email: true } },
            messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
          },
        })
      }
      return NextResponse.json({
        conversation: {
          id: conv.id,
          student: conv.student,
          lastMessage: conv.messages[0] ?? null,
          updatedAt: conv.updatedAt,
        },
      })
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    console.error("Chat with-student error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
