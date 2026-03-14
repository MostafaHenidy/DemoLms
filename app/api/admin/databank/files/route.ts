import { NextResponse } from "next/server"
import { readdir } from "fs/promises"
import path from "path"

const DIRS = [
  { dir: "public/uploads", baseUrl: "/uploads" },
  { dir: "public/uploads/lessons", baseUrl: "/uploads/lessons" },
] as const

const EXT_TO_TYPE: Record<string, string> = {
  ".pdf": "pdf",
  ".doc": "word",
  ".docx": "word",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".gif": "image",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".avi": "video",
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get("type") // optional: pdf | word | image | video

    const allFiles: { url: string; name: string; type: string }[] = []

    for (const { dir: dirPath, baseUrl } of DIRS) {
      const fullPath = path.join(process.cwd(), dirPath)
      let files: string[] = []
      try {
        files = await readdir(fullPath)
      } catch {
        continue
      }

      for (const name of files) {
        const ext = path.extname(name).toLowerCase()
        const fileType = EXT_TO_TYPE[ext]
        if (!fileType) continue
        if (typeFilter && fileType !== typeFilter) continue
        allFiles.push({
          url: `${baseUrl}/${name}`,
          name,
          type: fileType,
        })
      }
    }

    allFiles.sort((a, b) => b.name.localeCompare(a.name))
    return NextResponse.json({ files: allFiles })
  } catch (error) {
    console.error("Databank files list error", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
