"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ShoppingCart, Tag, ArrowRight, ArrowLeft, Star, Clock, Users, ShieldCheck, BadgePercent } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { coursesData } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AnimatedPageHero } from "@/components/ui/animated-page-hero"

type CartCourse = (typeof coursesData)[number] & { id: string }

export default function CartPage() {
  const { locale, dir, t } = useI18n()
  const { cart, removeFromCart, cartTotal, isLoggedIn, appliedCoupon, setAppliedCoupon } = useStore()
  const isRTL = dir === "rtl"

  const [couponCode, setCouponCode] = useState(appliedCoupon?.code ?? "")
  const couponApplied = !!appliedCoupon
  const [couponError, setCouponError] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [apiCourses, setApiCourses] = useState<CartCourse[]>([])

  useEffect(() => {
    fetch("/api/courses?limit=200")
      .then((r) => r.json())
      .then((data) => setApiCourses((data.courses ?? []).map((c: { id: string }) => ({ ...c, id: String(c.id) }))))
      .catch(() => setApiCourses([]))
  }, [])

  const courseById = useMemo(() => {
    const map = new Map<string, CartCourse>()
    coursesData.forEach((c) => map.set(c.id, { ...c, id: c.id }))
    apiCourses.forEach((c) => map.set(String(c.id), { ...c, id: String(c.id) }))
    return map
  }, [apiCourses])

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => courseById.get(item.courseId))
        .filter(Boolean) as CartCourse[],
    [cart, courseById]
  )

  const resolvedSubtotal = useMemo(
    () => cartItems.reduce((sum, c) => sum + (c?.price ?? 0), 0),
    [cartItems]
  )

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError(true)
      setTimeout(() => setCouponError(false), 3000)
      return
    }
    setCouponLoading(true)
    setCouponError(false)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: resolvedSubtotal }),
      })
      const data = await res.json()
      if (data.valid && data.discountAmount !== undefined) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
        })
      } else {
        setAppliedCoupon(null)
        setCouponError(true)
        setTimeout(() => setCouponError(false), 3000)
      }
    } catch {
      setAppliedCoupon(null)
      setCouponError(true)
      setTimeout(() => setCouponError(false), 3000)
    } finally {
      setCouponLoading(false)
    }
  }

  const subtotal = resolvedSubtotal
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0
  const total = subtotal - discount

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <div dir={dir} className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <AnimatedPageHero
        badge={locale === "ar" ? "سلة التسوق" : "Shopping Cart"}
        title={t("cart.title")}
        subtitle={cartItems.length > 0 ? `${cartItems.length} ${t("cart.items")}` : t("cart.empty")}
        compact
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {cartItems.length === 0 ? (
            <motion.div
              key="empty-cart"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white py-24 shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#2563EB]/10"
              >
                <ShoppingCart className="h-12 w-12 text-[#2563EB]/50" />
              </motion.div>
              <h2 className="mb-2 text-2xl font-bold text-[#0F172A]">{t("cart.empty")}</h2>
              <p className="mb-8 max-w-md text-center text-[#64748B]">{t("cart.emptyDesc")}</p>
              <Link href="/courses">
                <Button
                  size="lg"
                  className="group gap-2 rounded-xl bg-[#2563EB] px-8 text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_8px_28px_-4px_rgba(37,99,235,0.35)]"
                >
                  {t("cart.browseCourses")}
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:rtl:-translate-x-0.5" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cart-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-5">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: isRTL ? 80 : -80, scale: 0.95, transition: { duration: 0.3 } }}
                      transition={{ duration: 0.4, delay: idx * 0.06 }}
                      className="group overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white shadow-sm transition-all duration-300 hover:border-[#2563EB]/15 hover:shadow-[0_8px_30px_-8px_rgba(37,99,235,0.1)]"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative h-44 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44">
                          <Image
                            src={item.thumbnail}
                            alt={locale === "ar" ? item.titleAr : item.titleEn}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {item.originalPrice > item.price && (
                            <div className="absolute start-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                              -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                          <div>
                            <h3 className="text-lg font-bold leading-snug text-[#0F172A]">
                              {locale === "ar" ? item.titleAr : item.titleEn}
                            </h3>
                            <p className="mt-1 text-sm text-[#64748B]">
                              {locale === "ar" ? item.instructorAr : item.instructorEn}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-[#0F172A]">{item.rating}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {item.students.toLocaleString("en-US")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {item.hours}h
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-end justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-[#2563EB]">
                                {item.price} {t("bestCourses.currency")}
                              </span>
                              {item.originalPrice > item.price && (
                                <span className="text-sm text-[#94A3B8] line-through">
                                  {item.originalPrice} {t("bestCourses.currency")}
                                </span>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="gap-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">{t("cart.remove")}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Coupon */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <BadgePercent className="h-5 w-5 text-[#2563EB]" />
                    {t("cart.coupon")}
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t("cart.couponPlaceholder")}
                      dir="ltr"
                      disabled={couponLoading}
                      className={cn(
                        "h-12 flex-1 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] font-mono uppercase tracking-wider transition-colors focus:bg-white focus:border-[#2563EB] focus:ring-[#2563EB]/20",
                        couponApplied && "border-emerald-300 bg-emerald-50/50",
                        couponError && "border-red-300 bg-red-50/50"
                      )}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="h-12 rounded-xl bg-[#2563EB] px-6 text-white shadow-md shadow-[#2563EB]/20 transition-all hover:bg-[#1D4ED8] hover:shadow-lg disabled:opacity-70"
                    >
                      {couponLoading ? (locale === "ar" ? "جاري التحقق..." : "Verifying...") : t("cart.apply")}
                    </Button>
                  </div>
                  {couponApplied && appliedCoupon && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm font-medium text-emerald-600"
                    >
                      {appliedCoupon.code} —{" "}
                      {appliedCoupon.discountType === "percentage"
                        ? (locale === "ar" ? `خصم ${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue}% off`)
                        : (locale === "ar" ? `خصم ${discount} ${t("bestCourses.currency")}` : `${discount} ${t("bestCourses.currency")} off`)}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] px-6 py-6">
                      <h2 className="text-lg font-bold text-white">{t("cart.checkout")}</h2>
                      <p className="mt-1 text-sm text-white/70">{cartItems.length} {t("cart.items")}</p>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                              <Image src={item.thumbnail} alt="" fill unoptimized className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[#0F172A]">
                                {locale === "ar" ? item.titleAr : item.titleEn}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-[#2563EB]">
                              {item.price} {t("bestCourses.currency")}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#64748B]">{t("cart.subtotal")}</span>
                          <span className="font-semibold text-[#0F172A]">{subtotal} {t("bestCourses.currency")}</span>
                        </div>
                        {couponApplied && appliedCoupon && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-emerald-600">
                              {t("cart.discount")}{" "}
                              {appliedCoupon.discountType === "percentage"
                                ? `(${appliedCoupon.discountValue}%)`
                                : `(${appliedCoupon.code})`}
                            </span>
                            <span className="font-semibold text-emerald-600">-{discount} {t("bestCourses.currency")}</span>
                          </motion.div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[#0F172A]">{t("cart.total")}</span>
                          <span className="text-2xl font-extrabold text-[#2563EB]">{total.toFixed(0)} {t("bestCourses.currency")}</span>
                        </div>
                      </div>

                      <Link href={isLoggedIn ? "/checkout" : "/login"} className="block">
                        <Button className="group h-12 w-full gap-2 rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_8px_28px_-4px_rgba(37,99,235,0.35)]">
                          {isLoggedIn ? t("cart.checkout") : (locale === "ar" ? "سجل دخول للإكمال" : "Login to Checkout")}
                          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:rtl:-translate-x-0.5" />
                        </Button>
                      </Link>

                      <div className="flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>{locale === "ar" ? "دفع آمن ومشفّر" : "Secure encrypted payment"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  )
}
