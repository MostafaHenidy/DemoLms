import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const ALLOWED_ROLES = ["admin", "super_admin", "instructor"]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()
    const password = String(body.password ?? "")

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    // Try User table first (instructors, admin, super_admin)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        passwordHash: true,
        role: true,
        titleAr: true,
        titleEn: true,
        status: true,
      },
    })

    if (user?.passwordHash) {
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (valid && ALLOWED_ROLES.includes(user.role)) {
        const { passwordHash, ...publicUser } = user
        const response = NextResponse.json({ user: publicUser }, { status: 200 })
        response.cookies.set("adminAccessToken", `user-${user.id}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/",
        })
        return response
      }
    }

    // Try Admin table
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (admin) {
      const valid = await bcrypt.compare(password, admin.passwordHash)
      if (valid) {
        const adminUser = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          avatarUrl: null,
          role: "admin" as const,
          titleAr: null,
          titleEn: null,
          status: "active",
        }
        const response = NextResponse.json({ user: adminUser }, { status: 200 })
        response.cookies.set("adminAccessToken", `admin-${admin.id}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        })
        return response
      }
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Admin login error", error)
    const isPoolOrConnectionError =
      error instanceof Error &&
      (error.name === "DriverAdapterError" ||
        error.message?.includes("pool timeout") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("connect"))
    const message = isPoolOrConnectionError
      ? "تعذر الاتصال بقاعدة البيانات. تأكد من تشغيل MySQL (Xامب) ثم أعد المحاولة."
      : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
