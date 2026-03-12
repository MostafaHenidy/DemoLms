import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { id: "asc" },
    })
    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error("Events API error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

