import { NextResponse } from "next/server"
import {
  createConnection,
  type Connection,
  type RowDataPacket,
} from "mysql2/promise"

export const dynamic = "force-dynamic"

function getConnection() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }
  return createConnection(url)
}

export async function GET() {
  let conn: Connection | null = null
  try {
    conn = await getConnection()
    const [rows] = await conn.execute(
      "SELECT id, code, discountType, discountValue, maxUses, usedCount, expiresAt, createdAt, updatedAt FROM `coupon` ORDER BY createdAt DESC"
    )
    const coupons = (rows as Record<string, unknown>[]).map((r) => ({
      id: r.id,
      code: r.code,
      discountType: r.discountType,
      discountValue: r.discountValue,
      maxUses: r.maxUses,
      usedCount: r.usedCount,
      expiresAt: r.expiresAt ? new Date(r.expiresAt as Date).toISOString() : null,
      createdAt: new Date(r.createdAt as Date).toISOString(),
      updatedAt: new Date(r.updatedAt as Date).toISOString(),
    }))
    return NextResponse.json({ coupons })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Coupons GET error", err.message, err.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    )
  } finally {
    await conn?.end()
  }
}

export async function POST(request: Request) {
  let conn: Connection | null = null
  try {
    const body = await request.json()
    const prefix = String(body.prefix ?? "").trim().toUpperCase()
    const count = Math.min(Math.max(1, Number(body.count) || 1), 500)
    const discountType = body.discountType === "fixed" ? "fixed" : "percentage"
    const discountValue = Math.max(0, Number(body.discountValue) || 0)
    const maxUses = body.maxUses != null ? Math.max(1, Number(body.maxUses) || 1) : 1
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

    if (!prefix) {
      return NextResponse.json(
        { error: "البادئة مطلوبة" },
        { status: 400 }
      )
    }

    if (discountType === "percentage" && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json(
        { error: "نسبة الخصم يجب أن تكون بين 1 و 100" },
        { status: 400 }
      )
    }

    if (discountType === "fixed" && discountValue <= 0) {
      return NextResponse.json(
        { error: "قيمة الخصم الثابتة يجب أن تكون أكبر من صفر" },
        { status: 400 }
      )
    }

    conn = await getConnection()

    const [existingRows] = await conn.execute<RowDataPacket[]>(
      "SELECT code FROM `coupon`"
    )
    const existingCodes = new Set(existingRows.map((r) => r.code))

    const codes: string[] = []
    let suffix = 1
    while (codes.length < count) {
      const code = `${prefix}${String(suffix).padStart(4, "0")}`
      if (!existingCodes.has(code)) {
        codes.push(code)
        existingCodes.add(code)
      }
      suffix++
      if (suffix > 999999) break
    }

    if (codes.length === 0) {
      return NextResponse.json(
        { error: "لم يتم إنشاء أي كوبونات. قد تكون البادئة مستنفدة." },
        { status: 400 }
      )
    }

    const expiresVal = expiresAt ? expiresAt.toISOString().slice(0, 19).replace("T", " ") : null

    let createdCount = 0
    for (const code of codes) {
      await conn.execute(
        "INSERT INTO `coupon` (code, discountType, discountValue, maxUses, usedCount, expiresAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, NOW(), NOW())",
        [code, discountType, discountValue, maxUses, expiresVal]
      )
      createdCount++
    }

    return NextResponse.json(
      { created: createdCount, codes },
      { status: 201 }
    )
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    const detail = err.message
    console.error("Coupons POST error", detail, err.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: process.env.NODE_ENV === "development" ? detail : undefined,
      },
      { status: 500 }
    )
  } finally {
    await conn?.end()
  }
}
