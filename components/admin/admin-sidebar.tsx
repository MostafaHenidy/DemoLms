"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronLeft } from "lucide-react"
import { adminNavItems, instructorNavItems } from "@/lib/admin-nav"
import { getAdminUser, isInstructor } from "@/lib/admin-auth"

interface AdminSidebarProps {
  mobile?: boolean
}

export function AdminSidebar({ mobile }: AdminSidebarProps) {
  const pathname = usePathname()
  const user = getAdminUser()
  const isInstructorRole = isInstructor(user)
  const navItems = isInstructorRole ? instructorNavItems : adminNavItems
  const sidebarLabel = isInstructorRole ? "لوحة المدرب" : "لوحة الإدارة"
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === "/admin/dashboard"
    return pathname.startsWith(path)
  }

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const isParentActive = (item: (typeof navItems)[0]) => {
    if (item.children) {
      return item.children.some((c) => pathname.startsWith(c.path))
    }
    return isActive(item.path)
  }

  return (
    <aside
      className={`${mobile ? "flex" : "flex"} w-full max-w-[18rem] flex-col h-full bg-white border-s border-[#E2E8F0]/60`}
    >
      <div className="flex flex-col h-full">
        <div className="p-5 pb-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-lg shadow-[#2563EB]/15 ring-1 ring-black/5">
              <Image src="/company-logo.jpeg" alt="Logo" fill className="object-cover" sizes="40px" />
            </div>
            <div>
              <span className="font-bold text-[#0F172A] block">
                أكاديمية أنمكا
              </span>
              <span className="text-xs text-[#94A3B8]">{sidebarLabel}</span>
            </div>
          </Link>
        </div>

        {user && (
          <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#2563EB]/5 to-[#0EA5E9]/5 border border-[#2563EB]/10 p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-lg ring-2 ring-[#2563EB]/20">
                <Image
                  src={user.avatarUrl || "/user-avatar.png"}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-[#0F172A] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[#64748B]">
                  {user.role === "instructor" ? "مدرب" : "مسؤول"}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path)
            const parentActive = isParentActive(item)
            const expanded = expandedItems[item.path] ?? (item.children ? parentActive : false)

            if (item.children) {
              return (
                <div key={item.path}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.path)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      parentActive
                        ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="py-1 ps-4 space-y-0.5">
                          {item.children.map((child) => {
                            const childActive = pathname.startsWith(child.path)
                            return (
                              <Link
                                key={child.path}
                                href={child.path}
                                className={`block px-3 py-2 rounded-lg text-sm ${
                                  childActive
                                    ? "bg-[#2563EB]/10 text-[#2563EB] font-medium"
                                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                                }`}
                              >
                                {child.label}
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#E2E8F0]">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <ChevronLeft className="w-4 h-4" />
            العودة للموقع
          </Link>
        </div>
      </div>
    </aside>
  )
}
