import { NextResponse } from "next/server"
import { createConnection, type Connection } from "mysql2/promise"

export const dynamic = "force-dynamic"

function getConnection() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return createConnection(url)
}

export async function POST(request: Request) {
  let conn: Connection | null = null
  try {
    const body = await request.json()
    const code = String(body?.code ?? "").trim().toUpperCase()
    const subtotal = Math.max(0, Number(body?.subtotal) ?? 0)

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "كود الخصم مطلوب" },
        { status: 400 }
      )
    }

    conn = await getConnection()
    const [rows] = await conn.execute(
      "SELECT * FROM `coupon` WHERE `code` = ? LIMIT 1",
      [code]
    )
    const coupon = (rows as Record<string, unknown>[])[0]

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "كود الخصم غير صالح" },
        { status: 404 }
      )
    }

    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt as Date) : null
    if (expiresAt && new Date() > expiresAt) {
      return NextResponse.json(
        { valid: false, error: "انتهت صلاحية كود الخصم" },
        { status: 400 }
      )
    }

    const maxUses = coupon.maxUses != null ? Number(coupon.maxUses) : 1
    const usedCount = Number(coupon.usedCount ?? 0)
    if (usedCount >= maxUses) {
      return NextResponse.json(
        { valid: false, error: "تم استنفاد استخدام كود الخصم" },
        { status: 400 }
      )
    }

    const discountType = coupon.discountType as "percentage" | "fixed"
    const discountValue = Number(coupon.discountValue ?? 0)
    let discountAmount: number
    if (discountType === "percentage") {
      discountAmount = Math.round(subtotal * (discountValue / 100))
    } else {
      discountAmount = Math.min(discountValue, subtotal)
    }

    return NextResponse.json({
      valid: true,
      discountType,
      discountValue,
      discountAmount,
      code: coupon.code as string,
    })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Coupon validate error", err.message, err.stack)
    return NextResponse.json(
      {
        valid: false,
        error: "حدث خطأ أثناء التحقق من الكود",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    )
  } finally {
    await conn?.end()
  }
}
