"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAdminUser } from "@/lib/admin-auth"
import { clearAdminUser } from "@/lib/admin-auth"

interface AdminTopbarProps {
  onMenuClick?: () => void
  title?: string
  subtitle?: string
}

export function AdminTopbar({ onMenuClick, title = "لوحة التحكم", subtitle }: AdminTopbarProps) {
  const router = useRouter()
  const user = getAdminUser()

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    clearAdminUser()
    router.push("/admin/login")
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F0]/60">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#F1F5F9]"
          >
            <Menu className="w-5 h-5 text-[#0F172A]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">{title}</h1>
            {subtitle && (
              <p className="text-xs text-[#94A3B8]">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="بحث..."
            className="hidden w-48 sm:flex rounded-lg border-[#E2E8F0]/60 bg-[#F8FAFC]/60"
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/5 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-2 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 px-3 py-2 hover:bg-white hover:border-[#2563EB]/20 transition-colors">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image
                    src={user?.avatarUrl || "/user-avatar.png"}
                    alt={user?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {user?.role === "instructor" ? "مدرب" : "مسؤول"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/admin/profile">الملف الشخصي</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500"
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-xl text-red-500 hover:bg-red-50 sm:hidden"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
