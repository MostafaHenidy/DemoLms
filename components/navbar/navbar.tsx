"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  Globe,
  Menu,
  X,
  Sparkles,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const navLinks = [
  { key: "nav.home", href: "/" },
  { key: "nav.courses", href: "/courses" },
  { key: "nav.contact", href: "/contact" },
]

export function Navbar() {
  const { locale, dir, setLocale, t } = useI18n()
  const { user, isLoggedIn, logout, cartCount } = useStore()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isRTL = dir === "rtl"

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  useEffect(() => {
    if (!isProfileOpen) return
    const close = () => setIsProfileOpen(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [isProfileOpen])

  const toggleLocale = () => setLocale(locale === "ar" ? "en" : "ar")

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
    router.push("/")
  }

  return (
    <>
      <motion.header
        dir={dir}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          isScrolled
            ? "bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F0]/60 shadow-[0_4px_40px_rgba(0,0,0,0.04)]"
            : "bg-transparent"
        )}
      >
        <motion.div
          className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#8B5CF6]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-[72px] lg:h-20">
            {/* Brand with Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-10 w-10 overflow-hidden rounded-xl shadow-lg shadow-[#2563EB]/15 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-[#2563EB]/25 ring-1 ring-black/5"
              >
                <Image
                  src="/company-logo.jpeg"
                  alt="Anmka Academy"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-xl font-extrabold text-[#0F172A] tracking-tight block leading-tight">
                  {locale === "ar" ? "أكاديمية أنمكا" : "Anmka Academy"}
                </span>
                <span className="text-[10px] font-semibold text-[#2563EB] uppercase tracking-[0.15em]">
                  {locale === "ar" ? "منصة التعلّم" : "Learning Platform"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-0.5 rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 p-1 backdrop-blur-lg">
                {navLinks.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="group relative px-5 py-2.5 text-sm font-semibold text-[#64748B] transition-all duration-300 rounded-xl hover:text-[#2563EB] hover:bg-white hover:shadow-sm"
                  >
                    {t(link.key)}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleLocale}
                suppressHydrationWarning
                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 px-3.5 py-2 text-sm font-medium text-[#64748B] backdrop-blur-lg transition-all hover:border-[#2563EB]/20 hover:bg-white hover:text-[#2563EB] hover:shadow-sm"
              >
                <Globe className="w-4 h-4" />
                <span>{locale === "ar" ? "EN" : "عر"}</span>
              </motion.button>

              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 text-[#64748B] backdrop-blur-lg transition-all hover:border-[#2563EB]/20 hover:bg-white hover:text-[#2563EB] hover:shadow-sm"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white shadow-lg shadow-[#2563EB]/30"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              <div className="flex items-center gap-2 ms-1">
                {isLoggedIn && user ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      suppressHydrationWarning
                      className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/60 px-3 py-1.5 backdrop-blur-lg transition-all hover:border-[#2563EB]/20 hover:bg-white hover:shadow-sm"
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-lg ring-2 ring-[#2563EB]/20">
                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A] max-w-[100px] truncate">{user.name}</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 text-[#94A3B8] transition-transform", isProfileOpen && "rotate-180")} />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full end-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl"
                        >
                          <div className="border-b border-[#E2E8F0] px-4 py-3">
                            <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                            <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                          </div>
                          <div className="py-1.5">
                            <Link
                              href="/dashboard"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#2563EB]/5 hover:text-[#2563EB] transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                            </Link>
                            <Link
                              href="/dashboard/courses"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#2563EB]/5 hover:text-[#2563EB] transition-colors"
                            >
                              <User className="w-4 h-4" />
                              {locale === "ar" ? "دوراتي" : "My Courses"}
                            </Link>
                          </div>
                          <div className="border-t border-[#E2E8F0] py-1.5">
                            <button
                              onClick={handleLogout}
                              suppressHydrationWarning
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/5 font-semibold px-5 h-10">
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/register">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white shadow-lg shadow-[#2563EB]/25 hover:shadow-xl hover:shadow-[#2563EB]/35 transition-all font-semibold px-6 h-10 gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          {t("nav.register")}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                          />
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleLocale} suppressHydrationWarning className="flex items-center justify-center w-10 h-10 rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-colors">
                <Globe className="w-5 h-5" />
              </motion.button>
              <Link href="/cart">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">{cartCount}</span>
                  )}
                </div>
              </Link>
              {isLoggedIn && user && (
                <Link href="/dashboard">
                  <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-2 ring-[#2563EB]/20">
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  </div>
                </Link>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                suppressHydrationWarning
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[#0F172A] hover:bg-[#2563EB]/5 transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={isMobileMenuOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div dir={dir} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[60] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: isRTL ? 320 : -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isRTL ? 320 : -320, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={cn("absolute top-0 bottom-0 w-[320px] max-w-[85vw] bg-white/95 backdrop-blur-2xl flex flex-col shadow-2xl", isRTL ? "right-0" : "left-0")}
            >
              <div className="flex items-center justify-between px-6 h-20 border-b border-[#E2E8F0]/60">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="relative w-9 h-9 overflow-hidden rounded-xl ring-1 ring-black/5">
                    <Image src="/company-logo.jpeg" alt="Anmka Academy" fill className="object-cover" sizes="36px" />
                  </div>
                  <span className="font-bold text-lg text-[#0F172A]">{locale === "ar" ? "أكاديمية أنمكا" : "Anmka Academy"}</span>
                </Link>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsMobileMenuOpen(false)} suppressHydrationWarning className="p-2 rounded-xl text-[#64748B] hover:bg-[#2563EB]/5 transition-colors">
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {isLoggedIn && user && (
                <div className="px-6 py-4 border-b border-[#E2E8F0]/60 flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-xl ring-2 ring-[#2563EB]/20">
                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#0F172A] truncate">{user.name}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div key={link.key} initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 + 0.1 }}>
                      <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-[#0F172A] rounded-xl hover:bg-gradient-to-r hover:from-[#2563EB]/5 hover:to-transparent transition-all">
                        {t(link.key)}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-[#0F172A] rounded-xl hover:bg-gradient-to-r hover:from-[#2563EB]/5 hover:to-transparent transition-all">
                      <ShoppingCart className="w-5 h-5 text-[#64748B]" />
                      {t("nav.cart")}
                      {cartCount > 0 && <span className="ms-auto flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">{cartCount}</span>}
                    </Link>
                  </motion.div>
                  {isLoggedIn && (
                    <motion.div initial={{ opacity: 0, x: isRTL ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold text-[#0F172A] rounded-xl hover:bg-gradient-to-r hover:from-[#2563EB]/5 hover:to-transparent transition-all">
                        <LayoutDashboard className="w-5 h-5 text-[#64748B]" />
                        {locale === "ar" ? "لوحة التحكم" : "Dashboard"}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="px-4 pb-28 pt-4 space-y-2.5 border-t border-[#E2E8F0]/60">
                {isLoggedIn ? (
                  <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }} variant="outline" className="w-full justify-center h-12 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold gap-2">
                    <LogOut className="w-4 h-4" />
                    {locale === "ar" ? "تسجيل الخروج" : "Logout"}
                  </Button>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button variant="outline" className="w-full justify-center h-12 rounded-xl border-2 border-[#E2E8F0] text-[#0F172A] hover:bg-[#2563EB]/5 hover:border-[#2563EB]/30 font-semibold transition-all">
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block">
                      <Button className="w-full justify-center h-12 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white shadow-lg shadow-[#2563EB]/25 font-semibold gap-2">
                        <Sparkles className="w-4 h-4" />
                        {t("nav.register")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
