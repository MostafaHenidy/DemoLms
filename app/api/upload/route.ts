import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = "public/uploads"
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || ".jpg"
    const filename = `cover-${Date.now()}${ext}`
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR, filename)

    await mkdir(path.join(process.cwd(), UPLOAD_DIR), { recursive: true })
    await writeFile(uploadPath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Upload error", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
