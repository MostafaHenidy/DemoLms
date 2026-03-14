import { cookies } from "next/headers"

export type ChatActor = 
  | { type: "student"; userId: number }
  | { type: "admin"; adminId: number }
  | { type: "teacher"; userId: number }

/**
 * Resolve chat user from admin cookie (admin/teacher) or from query/body (student).
 * Students: GET use ?userId=, POST use body.userId.
 * Admin panel: adminAccessToken cookie.
 */
export async function getChatActor(request: Request, parsedBody?: Record<string, unknown>): Promise<ChatActor | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("adminAccessToken")?.value
  if (token) {
    const [prefix, idStr] = token.split("-")
    const id = parseInt(idStr, 10)
    if (id && !isNaN(id)) {
      if (prefix === "admin") return { type: "admin", adminId: id }
      if (prefix === "user") return { type: "teacher", userId: id }
    }
  }

  const url = new URL(request.url)
  const userIdParam = url.searchParams.get("userId")
  if (userIdParam) {
    const userId = parseInt(userIdParam, 10)
    if (userId && !isNaN(userId)) return { type: "student", userId }
  }
  if (parsedBody?.userId != null) {
    const userId = parseInt(String(parsedBody.userId), 10)
    if (userId && !isNaN(userId)) return { type: "student", userId }
  }
  return null
}
