import { NextResponse } from "next/server"
import { getPrismaClient } from "@/lib/prisma"

function buildTree(
  folders: { id: number; name: string; parentId: number | null; order: number }[],
  parentId: number | null
): { id: number; name: string; order: number; children: unknown[] }[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((f) => ({
      id: f.id,
      name: f.name,
      order: f.order,
      children: buildTree(folders, f.id),
    }))
}

function toDetail(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured", detail: "DATABASE_URL is missing" },
      { status: 503 }
    )
  }
  try {
    const prisma = getPrismaClient()
    const folders = await prisma.databankfolder.findMany({
      select: { id: true, name: true, parentId: true, order: true },
      orderBy: { order: "asc" },
    })
    const tree = buildTree(folders, null)
    return NextResponse.json({ folders: tree, flat: folders })
  } catch (error) {
    console.error("Databank folders list error", error)
    return NextResponse.json(
      {
        error: "Failed to list folders",
        ...(process.env.NODE_ENV === "development" && { detail: toDetail(error) }),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured", detail: "DATABASE_URL is missing" },
      { status: 503 }
    )
  }
  try {
    const prisma = getPrismaClient()
    const body = await request.json()
    const { name, parentId } = body
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name required" }, { status: 400 })
    }
    const parentIdNum =
      parentId != null && parentId !== "" ? parseInt(String(parentId), 10) : null
    if (parentIdNum !== null && (isNaN(parentIdNum) || parentIdNum < 1)) {
      return NextResponse.json({ error: "Invalid parentId" }, { status: 400 })
    }
    const count = await prisma.databankfolder.count({
      where: { parentId: parentIdNum },
    })
    const now = new Date()
    const folder = await prisma.databankfolder.create({
      data: {
        name: name.trim(),
        parentId: parentIdNum,
        order: count,
        updatedAt: now,
      },
    })
    return NextResponse.json({ folder })
  } catch (error) {
    console.error("Databank folder create error", error)
    return NextResponse.json(
      {
        error: "Failed to create folder",
        ...(process.env.NODE_ENV === "development" && { detail: toDetail(error) }),
      },
      { status: 500 }
    )
  }
}
