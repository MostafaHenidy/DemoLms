import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, name, email, phone, country, category, parentNumber, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة" },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مستخدم مسبقاً" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        country: country ? String(country).trim() : null,
        category: category ? String(category).trim() : null,
        parentNumber: parentNumber ? String(parentNumber).trim() : null,
        passwordHash,
        role: ["student", "instructor", "admin"].includes(String(role))
          ? (role as "student" | "instructor" | "admin")
          : "student",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Create user error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")?.trim()

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          status: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Users API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
