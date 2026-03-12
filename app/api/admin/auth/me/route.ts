import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminAccessToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [prefix, idStr] = token.split("-")
    const id = parseInt(idStr, 10)

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (prefix === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { id },
        select: { id: true, name: true, email: true },
      })
      if (!admin) {
        return NextResponse.json({ error: "Admin not found" }, { status: 401 })
      }
      return NextResponse.json({
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          avatarUrl: null,
          role: "admin",
          titleAr: null,
          titleEn: null,
          status: "active",
        },
      })
    }

    if (prefix === "user") {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          titleAr: true,
          titleEn: true,
          status: true,
        },
      })
      if (!user || !["admin", "super_admin", "instructor"].includes(user.role)) {
        return NextResponse.json({ error: "User not found or not authorized" }, { status: 401 })
      }
      return NextResponse.json({ user })
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  } catch (error) {
    console.error("Admin auth/me error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
