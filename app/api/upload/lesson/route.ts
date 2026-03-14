import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { checkDatabankQuota, registerDatabankFile } from "@/lib/databank"

const UPLOAD_DIR = "public/uploads/lessons"
const ALLOWED: Record<string, string[]> = {
  pdf: ["application/pdf"],
  word: [
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  ],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
}
const MAX_SIZES: Record<string, number> = {
  pdf: 20 * 1024 * 1024,   // 20MB
  word: 20 * 1024 * 1024,  // 20MB
  video: 500 * 1024 * 1024, // 500MB
  image: 10 * 1024 * 1024, // 10MB
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = (formData.get("type") as string) || "pdf" // pdf | word | video

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
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

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext =
      path.extname(file.name) ||
      (type === "pdf" ? ".pdf" : type === "word" ? ".docx" : type === "image" ? ".jpg" : ".mp4")
    const filename = `${type}-${Date.now()}${ext}`
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, filename)

    await mkdir(path.join(process.cwd(), UPLOAD_DIR), { recursive: true })
    await writeFile(uploadPath, buffer)

    const url = `/uploads/lessons/${filename}`
    const fileType = type as "pdf" | "word" | "video" | "image"
    await registerDatabankFile({
      path: url,
      originalName: file.name,
      type: fileType,
      size: file.size,
    })
    return NextResponse.json({ url, originalName: file.name })
  } catch (error) {
    console.error("Lesson upload error", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
