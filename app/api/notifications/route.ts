import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get("userId")
  const userId = userIdParam ? Number(userIdParam) : NaN

  try {
    const where = userId && !Number.isNaN(userId)
      ? {
          OR: [{ userId }, { userId: null }],
        }
      : { userId: null }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error("Notifications API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

