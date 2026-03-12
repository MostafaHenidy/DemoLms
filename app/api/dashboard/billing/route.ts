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
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            price: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    })

    const transactions = enrollments.map((e) => {
      const course = e.course
      const amount = course?.price ?? 0
      const date = e.purchasedAt.toISOString().slice(0, 10)

      return {
        id: e.id,
        date,
        courseId: course?.id ?? null,
        titleAr: course?.titleAr ?? "",
        titleEn: course?.titleEn ?? "",
        amount,
        status: "paid" as const,
      }
    })

    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const activeCourses = transactions.length
    const lastPurchase = transactions[0]?.date ?? null

    return NextResponse.json(
      {
        totalSpent,
        activeCourses,
        lastPurchase,
        transactions,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Billing API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

