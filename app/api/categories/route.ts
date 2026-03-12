import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tree = searchParams.get("tree") === "true"

    const flat = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
      select: { id: true, nameAr: true, nameEn: true, slug: true, parentId: true, order: true },
    })

    const byId = new Map(flat.map((c) => [c.id, c]))

    function pathFor(id: number, acc: string[] = []): string {
      const c = byId.get(id)
      if (!c) return acc.join(" › ")
      acc.unshift(c.nameAr)
      if (c.parentId) return pathFor(c.parentId, acc)
      return acc.join(" › ")
    }

    const flatWithPath = flat.map((c) => ({
      ...c,
      pathAr: pathFor(c.id),
    }))

    if (!tree) {
      return NextResponse.json({ categories: flatWithPath })
    }

    function buildTree(parentId: number | null = null): { id: number; nameAr: string; nameEn: string; slug: string; parentId: number | null; order: number; children: unknown[] }[] {
      return flat
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          ...c,
          children: buildTree(c.id),
        }))
    }

    return NextResponse.json({ categories: buildTree(), flat: flatWithPath })
  } catch (error) {
    console.error("Categories GET error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
