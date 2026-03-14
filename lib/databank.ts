import { prisma } from "@/lib/prisma"

export type DatabankFileType = "pdf" | "word" | "image" | "video"

/** Total databank storage limit: 100 GB */
export const DATABANK_LIMIT_BYTES = 100 * 1024 * 1024 * 1024

export async function getDatabankUsedBytes(): Promise<number> {
  const result = await prisma.databankfile.aggregate({
    _sum: { size: true },
  })
  return result._sum.size ?? 0
}

export async function checkDatabankQuota(additionalBytes: number): Promise<{ ok: boolean; used: number; limit: number }> {
  const used = await getDatabankUsedBytes()
  const limit = DATABANK_LIMIT_BYTES
  const ok = used + additionalBytes <= limit
  return { ok, used, limit }
}

/**
 * Register an uploaded file in the databank so it appears in the folder system.
 * Call this after successful upload from device (course cover, lesson content, or databank import).
 */
export async function registerDatabankFile(params: {
  path: string
  originalName: string
  type: DatabankFileType
  folderId?: number | null
  size?: number
}): Promise<void> {
  const { path, originalName, type, folderId, size = 0 } = params
  try {
    await prisma.databankfile.create({
      data: {
        path,
        originalName,
        type,
        folderId: folderId ?? null,
        size,
      },
    })
  } catch (e) {
    console.error("Databank register file error", e)
  }
}
