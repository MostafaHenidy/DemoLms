import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 })
    }
    const body = await request.json()
    const { name } = body
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name required" }, { status: 400 })
    }
    const folder = await prisma.databankfolder.update({
      where: { id: idNum },
      data: { name: name.trim() },
    })
    return NextResponse.json({ folder })
  } catch (error) {
    console.error("Databank folder rename error", error)
    return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const idNum = parseInt(id, 10)
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 })
    }
    await prisma.databankfolder.delete({
      where: { id: idNum },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Databank folder delete error", error)
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
  }
}
