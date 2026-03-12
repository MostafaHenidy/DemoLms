import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const VALID_STATUSES = ["active", "blocked", "pending"] as const
const VALID_ROLES = ["student", "instructor", "admin", "super_admin"] as const

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        city: true,
        country: true,
        category: true,
        parentNumber: true,
        bio: true,
        role: true,
        titleAr: true,
        titleEn: true,
        status: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("User GET error", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 })
    }

    const body = await request.json()

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const email = body.email != null ? String(body.email).trim().toLowerCase() : undefined
    if (email !== undefined) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم من قبل مستخدم آخر" },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (body.name != null) updateData.name = String(body.name).trim()
    if (body.email != null) updateData.email = String(body.email).trim().toLowerCase()
    if (body.phone !== undefined) updateData.phone = body.phone ? String(body.phone).trim() : null
    if (body.city !== undefined) updateData.city = body.city ? String(body.city).trim() : null
    if (body.country !== undefined) updateData.country = body.country ? String(body.country).trim() : null
    if (body.category !== undefined) updateData.category = body.category ? String(body.category).trim() : null
    if (body.parentNumber !== undefined) updateData.parentNumber = body.parentNumber ? String(body.parentNumber).trim() : null
    if (body.bio !== undefined) updateData.bio = body.bio ? String(body.bio).trim() : null
    if (body.role != null && VALID_ROLES.includes(body.role as (typeof VALID_ROLES)[number])) {
      updateData.role = body.role
    }
    if (body.status != null && VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
      updateData.status = body.status
    }
    if (body.titleAr !== undefined) updateData.titleAr = body.titleAr ? String(body.titleAr).trim() : null
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn ? String(body.titleEn).trim() : null

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phone: true,
        city: true,
        country: true,
        category: true,
        parentNumber: true,
        bio: true,
        role: true,
        titleAr: true,
        titleEn: true,
        status: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("User PUT error", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "معرف غير صالح" }, { status: 400 })
    }

    const body = await request.json()
    const status = body.status != null ? String(body.status).toLowerCase() : undefined

    if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: "الحالة يجب أن تكون: active أو blocked أو pending" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("User status update error", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
