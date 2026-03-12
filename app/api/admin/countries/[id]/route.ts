import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const body = await request.json()
    const nameAr =
      body.nameAr != null ? String(body.nameAr).trim() : undefined
    const nameEn =
      body.nameEn != null ? String(body.nameEn).trim() : undefined
    const codeRaw =
      body.code !== undefined
        ? body.code === null || body.code === ""
          ? null
          : String(body.code).trim().toUpperCase()
        : undefined

    const existing = await prisma.country.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 })
    }

    if (codeRaw !== undefined && codeRaw !== null) {
      const conflict = await prisma.country.findFirst({
        where: {
          code: codeRaw,
          NOT: { id },
        },
      })
      if (conflict) {
        return NextResponse.json(
          { error: "كود الدولة مستخدم بالفعل" },
          { status: 409 }
        )
      }
    }

    const data: Record<string, unknown> = {}
    if (nameAr !== undefined) data.nameAr = nameAr
    if (nameEn !== undefined) data.nameEn = nameEn
    if (codeRaw !== undefined) data.code = codeRaw

    const country = await prisma.country.update({
      where: { id },
      data,
    })

    return NextResponse.json({ country })
  } catch (error) {
    console.error("Countries PUT error", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    const existing = await prisma.country.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 })
    }

    await prisma.country.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Countries DELETE error", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

