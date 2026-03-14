import { NextResponse } from "next/server"
import { readdir } from "fs/promises"
import path from "path"

const UPLOAD_DIR = "public/uploads"
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

export async function GET() {
  try {
    const dir = path.join(process.cwd(), UPLOAD_DIR)
    let files: string[] = []
    try {
      files = await readdir(dir)
    } catch {
      return NextResponse.json({ images: [] })
    }

    const images = files
      .filter((f) => IMAGE_EXT.includes(path.extname(f).toLowerCase()))
      .map((name) => ({
        url: `/uploads/${name}`,
        name,
      }))
      .sort((a, b) => b.name.localeCompare(a.name))

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Databank images list error", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}
