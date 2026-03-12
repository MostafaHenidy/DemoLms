import type { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrisma(): PrismaClient {
  const { PrismaClient: PC } = require("@prisma/client")
  const { PrismaMariaDb } = require("@prisma/adapter-mariadb")
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env in the demolms folder.")
  }
  return new PC({
    adapter: new PrismaMariaDb(url),
    log: ["error", "warn"],
  })
}

function getPrisma(): PrismaClient {
  let instance = global.prisma ?? createPrisma()
  // Recreate if cached instance is missing new models (e.g. after schema change without restart)
  const hasHomework = (instance as { homework?: unknown }).homework != null
  if (process.env.NODE_ENV !== "production" && !hasHomework) {
    global.prisma = undefined
    for (const key of Object.keys(require.cache)) {
      if (
        key.includes(".prisma") ||
        key.includes("@prisma/client") ||
        key.includes("adapter-mariadb")
      ) {
        delete require.cache[key]
      }
    }
    instance = createPrisma()
    global.prisma = instance
  }
  return instance
}

export const prisma = getPrisma()

/** Call this to ensure you get a client with all models (e.g. homework). Use in APIs that use newer models. */
export function getPrismaClient(): PrismaClient {
  return getPrisma()
}

