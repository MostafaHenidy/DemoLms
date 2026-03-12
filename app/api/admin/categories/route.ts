import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export interface CategoryTreeNode {
  id: number
  nameAr: string
  nameEn: string
  slug: string
  parentId: number | null
  order: number
  coursesCount: number
  children: CategoryTreeNode[]
}

function buildTree(
  items: { id: number; nameAr: string; nameEn: string; slug: string; parentId: number | null; order: number; coursesCount?: number }[],
  parentId: number | null = null
): CategoryTreeNode[] {
  return items
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((c) => ({
      id: c.id,
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      slug: c.slug,
      parentId: c.parentId,
      order: c.order,
      coursesCount: c.coursesCount ?? 0,
      children: buildTree(items, c.id),
    }))
}

export async function GET() {
  try {
    const flat = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    })
    const flatWithCount = flat.map((c) => ({ ...c, coursesCount: 0 }))
    const tree = buildTree(flatWithCount)
    return NextResponse.json({ categories: tree, flat: flatWithCount })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Categories GET error", err.message, err.stack)
    return NextResponse.json(
      { error: "Internal server error", detail: process.env.NODE_ENV === "development" ? err.message : undefined },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nameAr = String(body.nameAr ?? "").trim()
    const nameEn = String(body.nameEn ?? "").trim()
    let slug = nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    if (!slug) slug = `category-${Date.now()}`
    const parentId = body.parentId != null ? parseInt(String(body.parentId), 10) : null
    const order = body.order != null ? parseInt(String(body.order), 10) : 0

    if (!nameAr || !nameEn) {
      return NextResponse.json({ error: "الاسم بالعربية والإنجليزية مطلوب" }, { status: 400 })
    }

    if (parentId != null) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } })
      if (!parent) {
        return NextResponse.json({ error: "التصنيف الأب غير موجود" }, { status: 400 })
      }
    }

    const existing = await prisma.category.findFirst({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "الرابط (slug) مستخدم بالفعل" }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: { nameAr, nameEn, slug, parentId, order },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error("Categories POST error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
