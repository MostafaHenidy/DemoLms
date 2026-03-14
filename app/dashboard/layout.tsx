"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  CreditCard,
  Heart,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Bell,
  Search,
  Star,
  Video,
  MessageCircle,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { key: "overview", path: "/dashboard", icon: LayoutDashboard, color: "from-[#2563EB] to-[#3B82F6]" },
  { key: "myCourses", path: "/dashboard/courses", icon: BookOpen, color: "from-[#0EA5E9] to-[#38BDF8]" },
  { key: "liveSessions", path: "/dashboard/live-sessions", icon: Video, color: "from-[#10B981] to-[#34D399]" },
  { key: "chat", path: "/dashboard/chat", icon: MessageCircle, color: "from-[#6366F1] to-[#818CF8]" },
  { key: "certificates", path: "/dashboard/certificates", icon: Award, color: "from-[#8B5CF6] to-[#A78BFA]" },
  { key: "achievements", path: "/dashboard/achievements", icon: Star, color: "from-amber-400 to-orange-500" },
  { key: "profile", path: "/dashboard/profile", icon: User, color: "from-[#F59E0B] to-[#FBBF24]" },
  { key: "billing", path: "/dashboard/billing", icon: CreditCard, color: "from-[#059669] to-[#34D399]" },
  { key: "wishlist", path: "/dashboard/wishlist", icon: Heart, color: "from-[#EC4899] to-[#F472B6]" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir, setLocale, t } = useI18n()
  const { user, isLoggedIn, logout, purchasedCourses } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<
    { id: number; titleAr: string; titleEn: string; bodyAr?: string; bodyEn?: string; createdAt: string }[]
  >([])
  const [progressPercent, setProgressPercent] = useState(0)
  const isRTL = dir === "rtl"

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userIdNum = user ? Number(user.id) : NaN
        const query = userIdNum && !Number.isNaN(userIdNum) ? `?userId=${userIdNum}` : ""
        const res = await fetch(`/api/notifications${query}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
        }
      } catch {
        // ignore
      }
    }
    if (notificationsOpen) {
      fetchNotifications()
    }
  }, [notificationsOpen, user])

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/summary?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        const totalHours = typeof data.totalHours === "number" ? data.totalHours : 0
        // Simple goal: 200 hours = 100%
        const pct = Math.max(0, Math.min(100, Math.round((totalHours / 200) * 100)))
        setProgressPercent(pct)
      } catch {
        // ignore
      }
    }
    fetchProgress()
  }, [user])

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-10 h-10 overflow-hidden rounded-2xl shadow-lg shadow-[#2563EB]/15 ring-1 ring-black/5"
          >
            <Image src="/company-logo.jpeg" alt="Anmka Academy" fill className="object-cover" sizes="40px" />
          </motion.div>
          <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">
            {locale === "ar" ? "أكاديمية أنمكا" : "Anmka Academy"}
          </span>
        </Link>
      </div>

      {/* User card */}
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-[#2563EB]/5 to-[#0EA5E9]/5 border border-[#2563EB]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-2 ring-[#2563EB]/20">
            <Image
              src={user?.avatar || "/user-avatar.png"}
              alt={user?.name || ""}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-[#0F172A] truncate">{user?.name || (locale === "ar" ? "طالب" : "Student")}</p>
            <p className="text-xs text-[#64748B]">{purchasedCourses.length} {locale === "ar" ? "دورات" : "courses"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#0EA5E9]"
            />
          </div>
          <span className="text-[10px] font-bold text-[#2563EB]">
            {progressPercent}%
          </span>
        </div>
        <p className="text-[10px] text-[#94A3B8] mt-1">
          {locale === "ar" ? "مستوى التقدم الإجمالي" : "Overall Progress"}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {sidebarItems.map((item, i) => {
          const active = isActive(item.path)
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
            >
              <Link
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  active ? "bg-white/20" : "bg-[#F1F5F9] group-hover:bg-white"
                }`}>
                  <item.icon className={`w-4 h-4 ${active ? "text-white" : "text-[#94A3B8] group-hover:text-[#2563EB]"}`} />
                </div>
                {t(`dashboard.${item.key}`)}
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ms-auto h-2 w-2 rounded-full bg-white"
                  />
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Upgrade card */}
      <div className="mx-4 mb-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] p-4 text-white">
          <div className="pointer-events-none absolute -top-6 -end-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-4 -start-4 h-16 w-16 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">{locale === "ar" ? "ترقية الباقة" : "Upgrade Plan"}</span>
            </div>
            <p className="text-[11px] text-white/70 mb-3 leading-relaxed">
              {locale === "ar" ? "احصل على وصول غير محدود لجميع الدورات" : "Get unlimited access to all courses"}
            </p>
            <Link href="/courses">
              <button className="w-full rounded-xl bg-white/20 backdrop-blur-sm py-2 text-xs font-bold hover:bg-white/30 transition-colors">
                {locale === "ar" ? "اكتشف المزيد" : "Explore"}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-[#E2E8F0] pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <LogOut className="w-4 h-4" />
          </div>
          {t("dashboard.logout")}
        </button>
      </div>
    </div>
  )

  return (
    <div dir={dir} className="min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[280px] lg:flex-col bg-white border-e border-[#E2E8F0]/60 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 w-[280px] bg-white z-50 lg:hidden shadow-2xl"
              style={{ [isRTL ? "right" : "left"]: 0 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="lg:ms-[280px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F0]/60">
          <div className="flex items-center justify-between px-6 h-[72px]">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#0F172A]" />
              </motion.button>
              <div>
                <h1 className="text-lg font-bold text-[#0F172A]">{t("dashboard.title")}</h1>
                <p className="text-xs text-[#94A3B8] hidden sm:block">
                  {locale === "ar" ? "إدارة حسابك ودوراتك" : "Manage your account and courses"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 text-[#64748B] hover:border-[#2563EB]/20 hover:bg-white hover:text-[#2563EB] transition-all"
              >
                <Bell className="w-[18px] h-[18px]" />
              </motion.button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full end-0 mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-xl z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-sm font-bold text-[#0F172A]">
                        {locale === "ar" ? "الإشعارات" : "Notifications"}
                      </span>
                    </div>
                    <div className="py-2">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-xs text-[#94A3B8]">
                          {locale === "ar" ? "لا توجد إشعارات حالياً" : "No notifications right now"}
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="px-4 py-3 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]"
                          >
                            <p className="text-xs font-semibold text-[#0F172A]">
                              {locale === "ar" ? n.titleAr : n.titleEn}
                            </p>
                            {(n.bodyAr || n.bodyEn) && (
                              <p className="mt-1 text-[11px] text-[#64748B]">
                                {locale === "ar" ? n.bodyAr : n.bodyEn}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="gap-2 rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/5"
              >
                <Globe className="w-4 h-4" />
                {locale === "ar" ? "EN" : "عر"}
              </Button>
              <div className="hidden sm:flex items-center gap-2.5 ms-2 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 px-3 py-1.5">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                  <Image src={user?.avatar || "/user-avatar.png"} alt="" fill className="object-cover" />
                </div>
                <span className="text-sm font-semibold text-[#0F172A] max-w-[100px] truncate">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-5 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
      </div>
    </div>
  )
}
