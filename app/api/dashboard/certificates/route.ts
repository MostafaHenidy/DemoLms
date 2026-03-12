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
            instructorAr: true,
            instructorEn: true,
          },
        },
      },
      orderBy: { purchasedAt: "desc" },
    })

    const certificates = enrollments.map((e, idx) => {
      const course = e.course
      const dateStr = e.purchasedAt.toISOString().slice(0, 10)
      const code = `CERT-${e.purchasedAt.getFullYear()}-${String(idx + 1).padStart(3, "0")}`

      return {
        id: e.id,
        courseId: course?.id ?? null,
        titleAr: course?.titleAr ?? "",
        titleEn: course?.titleEn ?? "",
        instructorAr: course?.instructorAr ?? "",
        instructorEn: course?.instructorEn ?? "",
        issuedAt: dateStr,
        code,
      }
    })

    return NextResponse.json({ certificates }, { status: 200 })
  } catch (error) {
    console.error("Certificates API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

