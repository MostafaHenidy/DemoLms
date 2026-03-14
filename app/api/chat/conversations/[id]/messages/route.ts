import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"
import { getChatActor } from "@/lib/chat-auth"

function canAccessConversation(
  conv: { studentId: number; counterpartType: string; counterpartAdminId: number | null; counterpartUserId: number | null },
  actor: { type: string; userId?: number; adminId?: number }
): boolean {
  if (actor.type === "student") return conv.studentId === actor.userId
  if (actor.type === "admin") return conv.counterpartType === "admin" && conv.counterpartAdminId === actor.adminId
  if (actor.type === "teacher") return conv.counterpartType === "teacher" && conv.counterpartUserId === actor.userId
  return false
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getChatActor(request)
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const convId = parseInt(id, 10)
    if (!convId || isNaN(convId)) {
      return NextResponse.json({ error: "Invalid conversation id" }, { status: 400 })
    }

    const prisma = getPrismaClient()
    const conv = await prisma.chatconversation.findUnique({
      where: { id: convId },
      select: { id: true, studentId: true, counterpartType: true, counterpartAdminId: true, counterpartUserId: true },
    })
    if (!conv || !canAccessConversation(conv, actor)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const messages = await prisma.chatmessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" },
      include: {
        senderUser: { select: { id: true, name: true } },
        senderAdmin: { select: { id: true, name: true } },
      },
    })

    const items = messages.map((m) => ({
      id: m.id,
      body: m.body,
      senderType: m.senderType,
      senderUserId: m.senderUserId,
      senderAdminId: m.senderAdminId,
      senderName: m.senderUser?.name ?? m.senderAdmin?.name ?? null,
      createdAt: m.createdAt,
    }))

    return NextResponse.json({ messages: items })
  } catch (error) {
    console.error("Chat messages list error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = (await request.json()) as { body?: string; userId?: number }
    const actor = await getChatActor(request, body)
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params
    const convId = parseInt(id, 10)
    if (!convId || isNaN(convId)) {
      return NextResponse.json({ error: "Invalid conversation id" }, { status: 400 })
    }

    const text = typeof body.body === "string" ? body.body.trim() : ""
    if (!text) return NextResponse.json({ error: "Message body required" }, { status: 400 })

    const prisma = getPrismaClient()
    const conv = await prisma.chatconversation.findUnique({
      where: { id: convId },
      select: { id: true, studentId: true, counterpartType: true, counterpartAdminId: true, counterpartUserId: true },
    })
    if (!conv || !canAccessConversation(conv, actor)) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    let senderType: string
    let senderUserId: number | null = null
    let senderAdminId: number | null = null

    if (actor.type === "student") {
      senderType = "student"
      senderUserId = actor.userId
    } else if (actor.type === "admin") {
      senderType = "admin"
      senderAdminId = actor.adminId
    } else {
      senderType = "teacher"
      senderUserId = actor.userId
    }

    const message = await prisma.chatmessage.create({
      data: {
        conversationId: convId,
        senderType,
        senderUserId,
        senderAdminId,
        body: text,
      },
      include: {
        senderUser: { select: { id: true, name: true } },
        senderAdmin: { select: { id: true, name: true } },
      },
    })

    await prisma.chatconversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    })

    const payload = {
      id: message.id,
      body: message.body,
      senderType: message.senderType,
      senderUserId: message.senderUserId,
      senderAdminId: message.senderAdminId,
      senderName: message.senderUser?.name ?? message.senderAdmin?.name ?? null,
      createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : String(message.createdAt),
    }

    try {
      const notifyUrl = process.env.CHAT_SOCKET_URL || "http://localhost:3001"
      const res = await fetch(`${notifyUrl}/notify-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, message: payload }),
      })
      if (!res.ok && process.env.NODE_ENV === "development") {
        console.warn("Chat socket notify failed:", res.status, await res.text())
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Chat socket server unreachable (run npm run dev:chat):", (err as Error).message)
      }
    }

    return NextResponse.json({ message: payload })
  } catch (error) {
    console.error("Chat send message error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
