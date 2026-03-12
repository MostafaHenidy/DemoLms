import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string; attachmentId: string }> }
) {
  try {
    const { attachmentId } = await params
    const id = parseInt(attachmentId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid attachment ID" }, { status: 400 })
    }

    await prisma.lessonattachment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete attachment error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
