"use client"

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import { GraduationCap, BookOpen, Users, Star, Sparkles, ArrowRight, ArrowLeft, Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import Link from "next/link"
import { useEffect, useState } from "react"

const stats = [
  { key: "students", value: "15,000+", icon: Users },
  { key: "courses", value: "200+", icon: BookOpen },
  { key: "instructors", value: "50+", icon: GraduationCap },
  { key: "rating", value: "4.8", icon: Star },
]

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.7) * 45,
  y: 50 + Math.cos(i * 0.5) * 45,
  size: 2 + (i % 3) + 0.5,
  duration: 6 + (i % 4) + 2,
  delay: i % 4,
}))

function AnimatedCounter({ value, delay }: { value: string; delay: number }) {
  const [displayed, setDisplayed] = useState("0")
  const numericPart = value.replace(/[^0-9.]/g, "")
  const suffix = value.replace(/[0-9.]/g, "")

  useEffect(() => {
    const target = parseFloat(numericPart.replace(",", ""))
    const duration = 2000
    const startTime = Date.now() + delay * 1000
    const tick = () => {
      const elapsed = Date.now() - startTime
      if (elapsed < 0) { requestAnimationFrame(tick); return }
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(target * eased)
      setDisplayed(current.toLocaleString("en-US") + suffix)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [numericPart, suffix, delay])

  return <>{displayed}</>
}

export default function HeroSection() {
  const { t, dir, locale } = useI18n()
  const isRTL = dir === "rtl"

  const textReveal = {
    hidden: { opacity: 0, y: 50, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.8, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  }

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
  }

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-[#FAFBFC]" dir={dir}>
      {/* Animated mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 20% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 85% 75%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 50% 40% at 50% 50%, rgba(37, 99, 235, 0.04) 0%, transparent 60%),
              linear-gradient(180deg, #FAFBFC 0%, #F0F4FA 100%)
            `,
          }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 start-[-10%] h-[700px] w-[700px] rounded-full bg-[#2563EB]/[0.07] blur-[140px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            x: [0, 60, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 end-[-5%] h-[600px] w-[600px] rounded-full bg-[#0EA5E9]/[0.06] blur-[120px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] start-[40%] h-[400px] w-[400px] rounded-full bg-[#2563EB]/[0.04] blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#2563EB]/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              y: [0, -40, 0],
              x: [0, p.id % 2 === 0 ? 20 : -20, 0],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating decorative elements with rich animations */}
      <motion.div
        className="pointer-events-none absolute end-[7%] top-[12%] hidden h-16 w-16 rounded-2xl border border-[#2563EB]/15 bg-white/90 shadow-xl backdrop-blur-md lg:block"
        animate={{ y: [0, -24, 0], rotate: [0, 8, -4, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full items-center justify-center">
          <BookOpen className="h-7 w-7 text-[#2563EB]/60" />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-[30%] start-[4%] hidden h-14 w-14 rounded-2xl border border-[#0EA5E9]/20 bg-white/90 shadow-lg backdrop-blur-md lg:block"
        animate={{ y: [0, 18, 0], rotate: [0, -6, 4, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex h-full items-center justify-center">
          <GraduationCap className="h-6 w-6 text-[#0EA5E9]/60" />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute end-[15%] top-[55%] hidden h-12 w-12 rounded-full border border-[#2563EB]/10 bg-white/80 shadow-lg backdrop-blur-md lg:block"
        animate={{ y: [0, -15, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="flex h-full items-center justify-center">
          <Star className="h-5 w-5 text-amber-400" />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute start-[12%] top-[22%] hidden h-10 w-10 rounded-full border border-emerald-200 bg-emerald-50/80 shadow-md lg:block"
        animate={{ y: [0, 12, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex h-full items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
        </div>
      </motion.div>

      {/* Animated line connectors */}
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" style={{ opacity: 0.06 }}>
        <motion.line
          x1="10%" y1="20%" x2="90%" y2="80%"
          stroke="#2563EB" strokeWidth="1" strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
        />
        <motion.line
          x1="85%" y1="15%" x2="15%" y2="75%"
          stroke="#0EA5E9" strokeWidth="1" strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut" }}
        />
      </svg>

      <div className="container relative mx-auto flex min-h-[100vh] flex-col items-center px-4 pb-8 pt-20 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:pb-16 lg:pt-24">
        {/* Text content */}
        <motion.div
          className="relative z-10 flex-1 text-center lg:text-start"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Badge */}
          <motion.div
            variants={textReveal}
            custom={0}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#2563EB]/20 bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#2563EB] shadow-[0_4px_16px_-2px_rgba(37,99,235,0.12)] backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
            {t("hero.browseCourses")}
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={textReveal}
            custom={1}
            className="mb-6 text-4xl font-extrabold leading-[1.2] tracking-tight text-[#0F172A] sm:text-5xl lg:text-[3.5rem] xl:text-6xl"
          >
            {t("hero.title")}
            <motion.span
              className="mt-3 block pb-2 bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#0EA5E9] bg-clip-text text-transparent"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              style={{ backgroundSize: "200% 100%" }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              {locale === "ar" ? "بكل سهولة ومرونة" : "With Ease & Flexibility"}
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={textReveal}
            custom={2}
            className="mx-auto mb-9 max-w-lg text-base leading-relaxed text-[#64748B] lg:mx-0 sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={textReveal}
            custom={3}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Button
              asChild
              size="lg"
              className="group relative h-12 overflow-hidden rounded-xl bg-[#2563EB] px-8 text-base font-bold shadow-[0_4px_24px_-4px_rgba(37,99,235,0.5)] transition-all duration-300 hover:bg-[#1D4ED8] hover:shadow-[0_8px_32px_-4px_rgba(37,99,235,0.45)] hover:scale-[1.02]"
            >
              <Link href="/courses" className="flex items-center gap-2">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                />
                {t("hero.browseCourses")}
                {isRTL ? (
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-12 rounded-xl border-2 border-[#E2E8F0] bg-white/80 px-8 text-base font-semibold text-[#0F172A] backdrop-blur-sm transition-all duration-300 hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 hover:text-[#2563EB] hover:scale-[1.02]"
            >
              <Link href="/courses" className="flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                {t("hero.startLearning")}
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={textReveal}
            custom={4}
            className="mt-10 flex items-center justify-center gap-6 lg:justify-start"
          >
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.4, ease: "backOut" }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] text-xs font-bold text-white shadow-md"
                >
                  {["أ", "م", "س", "ع"][i]}
                </motion.div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 1.6 + i * 0.08, duration: 0.4, ease: "backOut" }}
                  >
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </motion.div>
                ))}
                <span className="ms-1 font-bold text-[#0F172A]">4.8</span>
              </div>
              <p className="text-[#64748B]">{locale === "ar" ? "من +15,000 طالب" : "from 15,000+ students"}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Character image area */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -80 : 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative mt-16 flex flex-1 justify-center lg:mt-0 lg:max-w-[48%]"
        >
          <div className="relative flex h-[500px] w-full max-w-[420px] items-end justify-center lg:h-[580px] lg:max-w-[480px]">

            {/* Glow behind shape */}
            <motion.div
              className="absolute bottom-[10%] start-1/2 -translate-x-1/2 h-[240px] w-[340px] rounded-full bg-[#2563EB]/15 blur-[70px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Main square shape (rounded) — behind the character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute bottom-0 h-[360px] w-[340px] rounded-3xl sm:h-[380px] sm:w-[360px] lg:h-[430px] lg:w-[420px]"
              style={{
                background: "linear-gradient(145deg, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.12) 30%, rgba(14, 165, 233, 0.1) 60%, rgba(37, 99, 235, 0.06) 100%)",
                boxShadow: "0 32px 64px -16px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.12)",
              }}
            >
              {/* Inner glow animation */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                  background: [
                    "radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.12) 0%, transparent 60%)",
                    "radial-gradient(circle at 70% 70%, rgba(14, 165, 233, 0.12) 0%, transparent 60%)",
                    "radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.12) 0%, transparent 60%)",
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Subtle pattern inside shape */}
              <div className="absolute inset-0 rounded-3xl opacity-[0.04]" style={{
                backgroundImage: "radial-gradient(circle, #2563EB 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />
            </motion.div>

            {/* Secondary decorative shape */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7, ease: "backOut" }}
              className="absolute -end-4 bottom-[15%] h-16 w-16 rounded-2xl border border-[#2563EB]/15 bg-white/90 shadow-xl backdrop-blur-sm lg:-end-8 lg:h-20 lg:w-20"
            >
              <motion.div
                className="flex h-full items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] lg:h-10 lg:w-10" />
              </motion.div>
            </motion.div>

            {/* Floating badge - students count */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 40 : -40, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.1, ease: "backOut" }}
              className="absolute -start-2 top-[35%] z-20 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md lg:-start-6"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10">
                  <Users className="h-5 w-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">+15,000</p>
                  <p className="text-xs text-[#64748B]">{locale === "ar" ? "طالب نشط" : "Active Students"}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating badge - rating */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 1.3, ease: "backOut" }}
              className="absolute -end-2 top-[18%] z-20 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] backdrop-blur-md lg:-end-6"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">4.8/5</p>
                  <p className="text-xs text-[#64748B]">{locale === "ar" ? "تقييم عالي" : "Top Rated"}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Orbit rings around character */}
            <motion.div
              className="pointer-events-none absolute bottom-[25%] start-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full border border-[#2563EB]/[0.06] sm:h-[380px] sm:w-[380px] lg:h-[460px] lg:w-[460px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute -top-1.5 start-1/2 h-3 w-3 rounded-full bg-[#2563EB]/30" />
            </motion.div>
            <motion.div
              className="pointer-events-none absolute bottom-[20%] start-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full border border-[#0EA5E9]/[0.04] sm:h-[440px] sm:w-[440px] lg:h-[520px] lg:w-[520px]"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute -top-1 start-1/2 h-2 w-2 rounded-full bg-[#0EA5E9]/25" />
            </motion.div>

            {/* Character image — appearing to emerge from behind the shape */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10 flex w-full justify-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-[420px] w-[340px] sm:h-[470px] sm:w-[380px] lg:h-[540px] lg:w-[440px]"
              >
                <Image
                  src="/hero-character.png"
                  alt="Learning platform"
                  fill
                  className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                  sizes="(max-width: 1024px) 380px, 440px"
                  priority
                />

                {/* Shadow under the character */}
                <div
                  className="absolute -bottom-2 start-1/2 -translate-x-1/2 h-6 w-[60%] rounded-full bg-[#0F172A]/10 blur-xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="container relative z-10 mx-auto -mt-4 px-4 pb-12 lg:-mt-8"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 rounded-2xl border border-[#E2E8F0]/80 bg-white/95 p-6 shadow-[0_8px_40px_-8px_rgba(15,23,42,0.08)] backdrop-blur-md sm:grid-cols-4 sm:divide-x sm:divide-[#E2E8F0] sm:rtl:divide-x-reverse">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.1, duration: 0.5, ease: "backOut" }}
                className="group flex flex-col items-center gap-2 px-4 py-2 transition-transform duration-300 hover:scale-105"
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/10 transition-colors duration-300 group-hover:bg-[#2563EB]/15"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Icon className="h-6 w-6 text-[#2563EB]" />
                </motion.div>
                <span className="text-2xl font-bold text-[#0F172A]">
                  <AnimatedCounter value={stat.value} delay={1.4 + i * 0.1} />
                </span>
                <span className="text-xs font-medium text-[#64748B]">{t(`hero.${stat.key}`)}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
