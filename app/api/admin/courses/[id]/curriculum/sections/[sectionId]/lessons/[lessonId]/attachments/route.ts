import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const id = parseInt(lessonId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
    }

    const attachments = await prisma.lessonattachment.findMany({
      where: { lessonId: id },
    })

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error("Attachments error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const lessonIdNum = parseInt(lessonId, 10)
    if (isNaN(lessonIdNum)) {
      return NextResponse.json({ error: "Invalid lesson ID" }, { status: 400 })
    }

    const body = await request.json()
    const { type, path, originalName } = body

    if (!type || !path || !originalName) {
      return NextResponse.json(
        { error: "type, path, and originalName required" },
        { status: 400 }
      )
    }

    const allowedTypes = ["pdf", "word", "image", "video"]
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "type must be pdf, word, image, or video" },
        { status: 400 }
      )
    }

    const attachment = await prisma.lessonattachment.create({
      data: {
        lessonId: lessonIdNum,
        type,
        path,
        originalName,
      },
    })

    return NextResponse.json({ attachment })
  } catch (error) {
    console.error("Create attachment error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
