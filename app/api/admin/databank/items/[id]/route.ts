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
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }
    const body = await request.json()
    const { folderId } = body
    const folderIdNum =
      folderId === undefined || folderId === null || folderId === "" || folderId === "root"
        ? null
        : parseInt(String(folderId), 10)
    if (folderId !== undefined && folderId !== null && folderId !== "" && folderId !== "root" && isNaN(folderIdNum)) {
      return NextResponse.json({ error: "Invalid folderId" }, { status: 400 })
    }
    const item = await prisma.databankfile.update({
      where: { id: idNum },
      data: { folderId: folderIdNum },
    })
    return NextResponse.json({ item })
  } catch (error) {
    console.error("Databank item move error", error)
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }
    await prisma.databankfile.delete({
      where: { id: idNum },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Databank item delete error", error)
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 })
  }
}
