import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = parseInt((await params).id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
        children: { orderBy: [{ order: "asc" }, { id: "asc" }] },
        _count: { select: { courses: true } },
      },
    })
    if (!category) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 })
    }
    return NextResponse.json({ category })
  } catch (error) {
    console.error("Category GET error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const nameAr = body.nameAr != null ? String(body.nameAr).trim() : undefined
    const nameEn = body.nameEn != null ? String(body.nameEn).trim() : undefined
    const parentId = body.parentId !== undefined
      ? (body.parentId === null || body.parentId === "" ? null : parseInt(String(body.parentId), 10))
      : undefined
    const order = body.order != null ? parseInt(String(body.order), 10) : undefined

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 })
    }

    if (parentId !== undefined && parentId !== null) {
      if (parentId === id) {
        return NextResponse.json({ error: "لا يمكن جعل التصنيف أباً لنفسه" }, { status: 400 })
      }
      const parent = await prisma.category.findUnique({ where: { id: parentId } })
      if (!parent) {
        return NextResponse.json({ error: "التصنيف الأب غير موجود" }, { status: 400 })
      }
      const wouldCycle = await isDescendant(parentId, id)
      if (wouldCycle) {
        return NextResponse.json({ error: "لا يمكن جعل التصنيف فرعاً لتصنيف فرعي منه" }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (nameAr !== undefined) updateData.nameAr = nameAr
    if (nameEn !== undefined) updateData.nameEn = nameEn
    if (parentId !== undefined) updateData.parentId = parentId
    if (order !== undefined) updateData.order = order

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json({ category })
  } catch (error) {
    console.error("Category PUT error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function deleteCategoryRecursive(categoryId: number): Promise<void> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })
  for (const child of children) {
    await deleteCategoryRecursive(child.id)
  }
  const cat = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { courses: true } } },
  })
  if (cat && cat._count.courses > 0) {
    throw new Error(`لا يمكن الحذف: ${cat._count.courses} دورة مرتبطة بهذا التصنيف`)
  }
  await prisma.category.delete({ where: { id: categoryId } })
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
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 404 })
    }
    await deleteCategoryRecursive(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error"
    if (msg.startsWith("لا يمكن الحذف")) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    console.error("Category DELETE error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function isDescendant(ancestorId: number, nodeId: number): Promise<boolean> {
  let current = await prisma.category.findUnique({
    where: { id: nodeId },
    select: { parentId: true },
  })
  while (current?.parentId != null) {
    if (current.parentId === ancestorId) return true
    current = await prisma.category.findUnique({
      where: { id: current.parentId },
      select: { parentId: true },
    })
  }
  return false
}
