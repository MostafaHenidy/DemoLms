import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { getChatActor } from "@/lib/chat-auth"

export async function GET(request: Request) {
  try {
    const actor = await getChatActor(request)
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const prisma = getPrismaClient()

    if (actor.type === "student") {
      const list = await prisma.chatconversation.findMany({
        where: { studentId: actor.userId },
        orderBy: { updatedAt: "desc" },
        include: {
          counterpartAdmin: { select: { id: true, name: true, email: true } },
          counterpartUser: { select: { id: true, name: true, email: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
        },
      })
      const items = list.map((c) => ({
        id: c.id,
        counterpartType: c.counterpartType,
        counterpartAdmin: c.counterpartAdmin,
        counterpartUser: c.counterpartUser,
        lastMessage: c.messages[0] ?? null,
        updatedAt: c.updatedAt,
      }))
      return NextResponse.json({ conversations: items })
    }

    if (actor.type === "admin") {
      const list = await prisma.chatconversation.findMany({
        where: { counterpartType: "admin", counterpartAdminId: actor.adminId },
        orderBy: { updatedAt: "desc" },
        include: {
          student: { select: { id: true, name: true, email: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
        },
      })
      const items = list.map((c) => ({
        id: c.id,
        student: c.student,
        lastMessage: c.messages[0] ?? null,
        updatedAt: c.updatedAt,
      }))
      return NextResponse.json({ conversations: items })
    }

    if (actor.type === "teacher") {
      const list = await prisma.chatconversation.findMany({
        where: { counterpartType: "teacher", counterpartUserId: actor.userId },
        orderBy: { updatedAt: "desc" },
        include: {
          student: { select: { id: true, name: true, email: true } },
          messages: { take: 1, orderBy: { createdAt: "desc" }, select: { body: true, createdAt: true } },
        },
      })
      const items = list.map((c) => ({
        id: c.id,
        student: c.student,
        lastMessage: c.messages[0] ?? null,
        updatedAt: c.updatedAt,
      }))
      return NextResponse.json({ conversations: items })
    }

    return NextResponse.json({ conversations: [] })
  } catch (error) {
    console.error("Chat conversations list error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userId?: number
      counterpartType?: string
      counterpartAdminId?: number
      counterpartUserId?: number
    }
    const actor = await getChatActor(request, body)
    if (!actor || actor.type !== "student") {
      return NextResponse.json({ error: "Only students can create conversations" }, { status: 403 })
    }
    const counterpartType = body.counterpartType === "admin" ? "admin" : body.counterpartType === "teacher" ? "teacher" : null
    if (!counterpartType) {
      return NextResponse.json({ error: "counterpartType must be admin or teacher" }, { status: 400 })
    }

    const prisma = getPrismaClient()

    if (counterpartType === "admin") {
      const adminId = body.counterpartAdminId != null ? parseInt(String(body.counterpartAdminId), 10) : NaN
      if (!adminId || isNaN(adminId)) {
        return NextResponse.json({ error: "counterpartAdminId required" }, { status: 400 })
      }
      const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { id: true } })
      if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 })

      let conv = await prisma.chatconversation.findFirst({
        where: { studentId: actor.userId, counterpartType: "admin", counterpartAdminId: adminId },
      })
      if (!conv) {
        conv = await prisma.chatconversation.create({
          data: { studentId: actor.userId, counterpartType: "admin", counterpartAdminId: adminId },
        })
      }
      return NextResponse.json({ conversation: conv })
    }

    if (counterpartType === "teacher") {
      const teacherId = body.counterpartUserId != null ? parseInt(String(body.counterpartUserId), 10) : NaN
      if (!teacherId || isNaN(teacherId)) {
        return NextResponse.json({ error: "counterpartUserId required" }, { status: 400 })
      }
      const hasAccess = await prisma.enrollment.findFirst({
        where: {
          userId: actor.userId,
          course: { instructorId: teacherId },
        },
      })
      if (!hasAccess) {
        return NextResponse.json({ error: "You can only message teachers of courses you are enrolled in" }, { status: 403 })
      }

      let conv = await prisma.chatconversation.findFirst({
        where: { studentId: actor.userId, counterpartType: "teacher", counterpartUserId: teacherId },
      })
      if (!conv) {
        conv = await prisma.chatconversation.create({
          data: { studentId: actor.userId, counterpartType: "teacher", counterpartUserId: teacherId },
        })
      }
      return NextResponse.json({ conversation: conv })
    }

    return NextResponse.json({ error: "Invalid counterpartType" }, { status: 400 })
  } catch (error) {
    console.error("Chat create conversation error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
