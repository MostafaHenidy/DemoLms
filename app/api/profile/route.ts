import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get("userId"))
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 })
    }

    const data: any = {}
    if (typeof body.name === "string") data.name = body.name
    if (typeof body.email === "string") data.email = body.email
    if (typeof body.phone === "string") data.phone = body.phone
    if (typeof body.city === "string") data.city = body.city
    if (typeof body.country === "string") data.country = body.country
    if (typeof body.category === "string") data.category = body.category
    if (typeof body.parentNumber === "string") data.parentNumber = body.parentNumber
    if (typeof body.bio === "string") data.bio = body.bio

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
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
      },
    })

    return NextResponse.json({ user: updated }, { status: 200 })
  } catch (error) {
    console.error("Profile update error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

