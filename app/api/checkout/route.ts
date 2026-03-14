import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/** Request: enroll user in courses and record payment(s). Used for cart checkout and any gateway (Stripe, Moyasar, etc.). */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const items = Array.isArray(body.items) ? body.items : []
    const gateway = typeof body.gateway === "string" && body.gateway.trim() ? body.gateway.trim() : "cart"
    const couponCode =
      typeof body.couponCode === "string" && body.couponCode.trim()
        ? String(body.couponCode).trim().toUpperCase()
        : null
    const totalDiscountAmount = Math.max(0, Number(body.discountAmount) ?? 0)
    const transactionId =
      typeof body.transactionId === "string" && body.transactionId.trim()
        ? body.transactionId.trim()
        : null

    if (!userId || Number.isNaN(userId) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid userId or items" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const courseIds = items
      .map((i: { courseId?: number }) => Number(i?.courseId))
      .filter((id: number) => id && !Number.isNaN(id))
    if (courseIds.length === 0) {
      return NextResponse.json(
        { error: "No valid course IDs in items" },
        { status: 400 }
      )
    }

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, titleAr: true, titleEn: true, price: true },
    })
    const courseMap = new Map(courses.map((c) => [c.id, c]))
    const orderedCourses = courseIds
      .map((id) => courseMap.get(id))
      .filter(Boolean) as typeof courses

    if (orderedCourses.length === 0) {
      return NextResponse.json(
        { error: "No valid courses found. Ensure DB is seeded." },
        { status: 404 }
      )
    }

    const subtotal = orderedCourses.reduce((sum, c) => sum + (c.price ?? 0), 0)
    const discountAmounts: number[] =
      subtotal > 0 && totalDiscountAmount > 0
        ? orderedCourses.map((c) =>
            Math.round(
              (c.price / subtotal) * Math.min(totalDiscountAmount, subtotal)
            )
          )
        : orderedCourses.map(() => 0)
    const totalAllocated = discountAmounts.reduce((a, b) => a + b, 0)
    if (totalAllocated < totalDiscountAmount && discountAmounts.length > 0) {
      discountAmounts[0] += totalDiscountAmount - totalAllocated
    }

    const enrollments: { id: number; courseId: number }[] = []

    for (let i = 0; i < orderedCourses.length; i++) {
      const course = orderedCourses[i]
      const discount = discountAmounts[i] ?? 0
      const amount = Math.max(0, course.price - discount)

      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId, courseId: course.id },
        },
        create: {
          userId,
          courseId: course.id,
          status: "ACTIVE",
        },
        update: {},
        select: { id: true, courseId: true },
      })
      enrollments.push({ id: enrollment.id, courseId: enrollment.courseId })

      await prisma.payment.create({
        data: {
          userId,
          courseId: course.id,
          amount,
          status: "completed",
          itemType: "course",
          itemId: course.id,
          itemName: course.titleAr ?? course.titleEn ?? null,
          userName: user.name ?? null,
          userEmail: user.email ?? null,
          gateway,
          couponCode,
          discountAmount: discount > 0 ? discount : null,
          transactionId,
          enrollmentId: enrollment.id,
        },
      })
    }

    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    return NextResponse.json({
      ok: true,
      enrollments: enrollments.length,
      gateway,
      couponCode: couponCode ?? undefined,
    })
  } catch (error) {
    console.error("Checkout API error", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
