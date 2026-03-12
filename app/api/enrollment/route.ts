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

// GET /api/enrollment?userId=1 -> { courses: ["1","2",...] }
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userIdParam = searchParams.get("userId")
  const userId = userIdParam ? Number(userIdParam) : NaN

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json({ error: "Missing or invalid userId" }, { status: 400 })
  }

  let conn: Connection | null = null
  try {
    conn = await getConnection()
    const [rows] = await conn.execute(
      "SELECT courseId FROM `Enrollment` WHERE userId = ?",
      [userId]
    )
    const courses = (rows as { courseId: number }[]).map((r) => String(r.courseId))
    return NextResponse.json({ courses }, { status: 200 })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Enrollment GET error", err.message)
    return NextResponse.json(
      { error: "Internal server error", detail: process.env.NODE_ENV === "development" ? err.message : undefined },
      { status: 500 }
    )
  } finally {
    await conn?.end()
  }
}

// POST /api/enrollment  body: { userId: number, courseId: number }
export async function POST(request: Request) {
  let conn: Connection | null = null
  try {
    const body = await request.json()
    const userId = Number(body.userId)
    const courseId = Number(body.courseId)

    if (!userId || Number.isNaN(userId) || !courseId || Number.isNaN(courseId)) {
      return NextResponse.json({ error: "Missing or invalid userId/courseId" }, { status: 400 })
    }

    conn = await getConnection()

    // Verify user exists
    const [userRows] = await conn.execute("SELECT id FROM `User` WHERE id = ?", [userId])
    if ((userRows as unknown[]).length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify course exists
    const [courseRows] = await conn.execute("SELECT id FROM `Course` WHERE id = ?", [courseId])
    if ((courseRows as unknown[]).length === 0) {
      return NextResponse.json(
        { error: "Course not found. Ensure the database is seeded (npm run db:seed)." },
        { status: 404 }
      )
    }

    // Check if enrollment exists, insert if not
    const [existing] = await conn.execute(
      "SELECT id FROM `Enrollment` WHERE userId = ? AND courseId = ?",
      [userId, courseId]
    )
    const rows = existing as { id: number }[]

    if (rows.length === 0) {
      await conn.execute(
        "INSERT INTO `Enrollment` (userId, courseId, status, purchasedAt) VALUES (?, ?, 'ACTIVE', NOW())",
        [userId, courseId]
      )
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Enrollment POST error", err.message, err.stack)
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

