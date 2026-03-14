import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folderIdParam = searchParams.get("folderId")
    const folderId =
      folderIdParam === "" || folderIdParam === "root" || folderIdParam == null
        ? null
        : parseInt(folderIdParam, 10)
    if (folderIdParam != null && folderIdParam !== "" && folderIdParam !== "root" && isNaN(folderId)) {
      return NextResponse.json({ error: "Invalid folderId" }, { status: 400 })
    }
    const items = await prisma.databankfile.findMany({
      where: { folderId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Databank items list error", error)
    return NextResponse.json({ error: "Failed to list items" }, { status: 500 })
  }
}
