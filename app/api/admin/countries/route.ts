import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: [{ nameAr: "asc" }, { id: "asc" }],
    })
    return NextResponse.json({ countries })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Countries GET error", err.message, err.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nameAr = String(body.nameAr ?? "").trim()
    const nameEn = String(body.nameEn ?? "").trim()
    const code = body.code != null && body.code !== "" ? String(body.code).trim().toUpperCase() : null

    if (!nameAr || !nameEn) {
      return NextResponse.json(
        { error: "الاسم بالعربية والإنجليزية مطلوب" },
        { status: 400 }
      )
    }

    if (code) {
      const existing = await prisma.country.findFirst({
        where: { code },
      })
      if (existing) {
        return NextResponse.json(
          { error: "كود الدولة مستخدم بالفعل" },
          { status: 409 }
        )
      }
    }

    const country = await prisma.country.create({
      data: { nameAr, nameEn, code },
    })

    return NextResponse.json({ country }, { status: 201 })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Countries POST error", err.message, err.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}
