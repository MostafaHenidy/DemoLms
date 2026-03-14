import { NextResponse } from "next/server"
import { getDatabankUsedBytes, DATABANK_LIMIT_BYTES } from "@/lib/databank"

export async function GET() {
  try {
    const used = await getDatabankUsedBytes()
    const limit = DATABANK_LIMIT_BYTES
    const usedGB = (used / 1024 / 1024 / 1024).toFixed(2)
    const limitGB = (limit / 1024 / 1024 / 1024).toFixed(0)
    return NextResponse.json({
      usedBytes: used,
      limitBytes: limit,
      usedFormatted: `${usedGB} GB`,
      limitFormatted: `${limitGB} GB`,
    })
  } catch (error) {
    console.error("Databank storage error", error)
    return NextResponse.json({ error: "Failed to get storage" }, { status: 500 })
  }
}
