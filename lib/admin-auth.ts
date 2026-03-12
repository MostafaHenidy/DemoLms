"use client"

const ADMIN_USER_KEY = "adminUser"

export interface AdminUser {
  id: number
  name: string
  email: string
  avatarUrl: string | null
  role: "admin" | "super_admin" | "instructor"
  titleAr?: string | null
  titleEn?: string | null
  status?: string
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setAdminUser(user: AdminUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
}

export function clearAdminUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ADMIN_USER_KEY)
}

export function isInstructor(user: AdminUser | null): boolean {
  return user?.role === "instructor"
}

export function isAdmin(user: AdminUser | null): boolean {
  return user?.role === "admin" || user?.role === "super_admin"
}
