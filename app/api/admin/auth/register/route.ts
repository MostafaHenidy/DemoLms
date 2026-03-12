import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        avatarUrl: "/user-avatar.png",
        role: "instructor",
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Instructor register error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
