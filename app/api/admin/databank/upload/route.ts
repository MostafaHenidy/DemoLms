import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { checkDatabankQuota, registerDatabankFile } from "@/lib/databank"

const UPLOAD_DIR = "public/uploads/lessons"
const ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  word: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
}
const MAX_SIZES: Record<string, number> = {
  pdf: 20 * 1024 * 1024,
  word: 20 * 1024 * 1024,
  video: 500 * 1024 * 1024,
  image: 10 * 1024 * 1024,
}

const TYPES = ["pdf", "word", "video", "image"] as const

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "pdf"
    const folderIdParam = formData.get("folderId")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!TYPES.includes(type as (typeof TYPES)[number])) {
      return NextResponse.json(
        { error: "type must be pdf, word, video, or image" },
        { status: 400 }
      )
    }

    const allowedTypes = ALLOWED[type] || ALLOWED.pdf
    const maxSize = MAX_SIZES[type] || MAX_SIZES.pdf
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${Math.round(maxSize / 1024 / 1024)}MB for ${type}.` },
        { status: 400 }
      )
    }

    const quota = await checkDatabankQuota(file.size)
    if (!quota.ok) {
      return NextResponse.json(
        {
          error: `تجاوز حد التخزين (100 جيجا). المستخدم: ${(quota.used / 1024 / 1024 / 1024).toFixed(2)} جيجا.`,
        },
        { status: 507 }
      )
    }

    const ext =
      path.extname(file.name) ||
      (type === "pdf" ? ".pdf" : type === "word" ? ".docx" : type === "image" ? ".jpg" : ".mp4")
    const filename = `databank-${type}-${Date.now()}${ext}`
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, filename)

    await mkdir(path.join(process.cwd(), UPLOAD_DIR), { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(uploadPath, Buffer.from(bytes))

    const url = `/uploads/lessons/${filename}`
    let folderId: number | null = null
    if (folderIdParam != null && folderIdParam !== "") {
      const n = parseInt(String(folderIdParam), 10)
      if (!isNaN(n)) folderId = n
    }
    await registerDatabankFile({
      path: url,
      originalName: file.name,
      type: type as "pdf" | "word" | "video" | "image",
      folderId,
      size: file.size,
    })

    return NextResponse.json({
      url,
      originalName: file.name,
      type,
      size: file.size,
    })
  } catch (error) {
    console.error("Databank upload error", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
