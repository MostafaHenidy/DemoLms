import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get("userId")
  const userId = userIdParam ? Number(userIdParam) : NaN

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 })
  }

  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { courseId: true },
    })
    const courses = items.map((i) => i.courseId.toString())
    return NextResponse.json({ courses }, { status: 200 })
  } catch (error) {
    console.error("Wishlist GET error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const courseId = Number(body.courseId)
    if (!userId || Number.isNaN(userId) || !courseId || Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Missing or invalid userId/courseId" }, { status: 400 })
    }
    await prisma.wishlistItem.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Wishlist POST error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const courseId = Number(body.courseId)
    if (!userId || Number.isNaN(userId) || !courseId || Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Missing or invalid userId/courseId" }, { status: 400 })
    }
    await prisma.wishlistItem.deleteMany({
      where: { userId, courseId },
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error("Wishlist DELETE error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

