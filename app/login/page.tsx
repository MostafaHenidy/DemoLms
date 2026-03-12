"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Github,
  Chrome,
  Sparkles,
  BookOpen,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const orbs = [
  { x: "10%", y: "15%", size: 320, color: "rgba(37, 99, 235, 0.15)", delay: 0, duration: 12 },
  { x: "75%", y: "70%", size: 280, color: "rgba(14, 165, 233, 0.12)", delay: 3, duration: 14 },
  { x: "50%", y: "40%", size: 200, color: "rgba(139, 92, 246, 0.08)", delay: 6, duration: 10 },
  { x: "85%", y: "10%", size: 160, color: "rgba(37, 99, 235, 0.06)", delay: 2, duration: 16 },
]

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.65) * 45,
  y: 50 + Math.cos(i * 0.55) * 45,
  size: 1.5 + (i % 2) + 0.5,
  duration: 6 + (i % 4) + 2,
  delay: i % 5,
}))

const formFieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function LoginPage() {
  const { t, locale, dir, setLocale } = useI18n()
  const { login, isLoggedIn } = useStore()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLoggedIn) router.push("/dashboard")
  }, [isLoggedIn, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const success = await login(email, password)
    if (!success) {
      setError(locale === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password")
    }
  }

  const isRTL = dir === "rtl"

  return (
    <div className="relative flex min-h-screen" dir={dir}>
      {/* Full-screen animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#030712]">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 50%, rgba(37, 99, 235, 0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(14, 165, 233, 0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 45%)",
          }}
        />
        {/* Animated orbs */}
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
              x: [0, i % 2 === 0 ? 40 : -40, 0],
              y: [0, i % 2 === 0 ? -30 : 30, 0],
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          />
        ))}
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Floating particles */}
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
        {/* Diagonal beams */}
        <motion.div
          className="absolute -top-[20%] start-[30%] h-[140%] w-px rotate-[25deg] bg-gradient-to-b from-transparent via-[#2563EB]/10 to-transparent"
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-[20%] start-[60%] h-[140%] w-px rotate-[25deg] bg-gradient-to-b from-transparent via-[#0EA5E9]/8 to-transparent"
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Language Toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
        className="fixed top-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        style={isRTL ? { left: 24 } : { right: 24 }}
      >
        <Globe className="h-4 w-4" />
        {locale === "ar" ? "English" : "العربية"}
      </motion.button>

      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 items-center justify-center lg:flex">
        <div className="relative z-10 px-16 text-center">
          {/* Animated ring */}
          <motion.div
            className="relative mx-auto mb-10"
            style={{ width: 160, height: 160 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border border-[#2563EB]/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border border-dashed border-[#0EA5E9]/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-6 rounded-full border border-[#8B5CF6]/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            {/* Center icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#2563EB]/20 to-[#0EA5E9]/20 backdrop-blur-xl">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            {/* Orbiting dots */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute h-2.5 w-2.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#2563EB" : "#0EA5E9",
                  boxShadow: `0 0 12px ${i % 2 === 0 ? "#2563EB" : "#0EA5E9"}`,
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: [Math.cos((i * Math.PI) / 2) * 75, Math.cos((i * Math.PI) / 2 + Math.PI * 2) * 75],
                  y: [Math.sin((i * Math.PI) / 2) * 75, Math.sin((i * Math.PI) / 2 + Math.PI * 2) * 75],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              />
            ))}
          </motion.div>

          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white">
              {locale === "ar" ? "أكاديمية أنمكا" : "Anmka Academy"}
            </h1>
            <p className="mx-auto max-w-sm text-lg leading-relaxed text-white/50">
              {locale === "ar"
                ? "منصة تعليمية رائدة تهدف لتمكين المتعلمين بمحتوى عالي الجودة"
                : "A leading educational platform empowering learners with high-quality content"}
            </p>
          </motion.div>

          {/* Features row */}
          <div className="mt-12 flex items-center justify-center gap-8">
            {[
              { icon: BookOpen, labelAr: "500+ دورة", labelEn: "500+ Courses" },
              { icon: Zap, labelAr: "تعلم تفاعلي", labelEn: "Interactive" },
              { icon: Shield, labelAr: "شهادات معتمدة", labelEn: "Certified" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <item.icon className="h-5 w-5 text-[#2563EB]" />
                </div>
                <span className="text-xs font-medium text-white/40">
                  {locale === "ar" ? item.labelAr : item.labelEn}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-14 flex items-center justify-center gap-10"
          >
            {[
              { value: "10K+", labelAr: "طالب", labelEn: "Students" },
              { value: "4.9", labelAr: "تقييم", labelEn: "Rating" },
              { value: "98%", labelAr: "رضا", labelEn: "Satisfaction" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/30">
                  {locale === "ar" ? stat.labelAr : stat.labelEn}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          {/* Glass card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
            {/* Card glow */}
            <div className="pointer-events-none absolute -top-24 start-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#2563EB]/10 blur-[80px]" />

            {/* Top shimmer */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-8 text-center"
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#2563EB]/20 to-[#0EA5E9]/20 lg:hidden"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <GraduationCap className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                {t("auth.login.title")}
              </h1>
              <p className="text-sm text-white/40">{t("auth.login.subtitle")}</p>
            </motion.div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email */}
              <motion.div custom={0} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white/60">
                  {t("auth.login.email")}
                </Label>
                <div className="relative">
                  <Mail
                    className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "email" ? "text-[#2563EB]" : "text-white/25"
                    }`}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t("auth.login.email")}
                    className="h-12 border-white/[0.08] bg-white/[0.03] ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#2563EB]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#2563EB]/20"
                  />
                  {focusedField === "email" && (
                    <motion.div
                      layoutId="field-glow"
                      className="pointer-events-none absolute inset-0 rounded-md border border-[#2563EB]/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
              </motion.div>

              {/* Password */}
              <motion.div custom={1} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white/60">
                  {t("auth.login.password")}
                </Label>
                <div className="relative">
                  <Lock
                    className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "password" ? "text-[#2563EB]" : "text-white/25"
                    }`}
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t("auth.login.password")}
                    className="h-12 border-white/[0.08] bg-white/[0.03] pe-11 ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#2563EB]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#2563EB]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember + Forgot */}
              <motion.div
                custom={2}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                    className="border-white/20 data-[state=checked]:bg-[#2563EB] data-[state=checked]:border-[#2563EB]"
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-white/40">
                    {t("auth.login.remember")}
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#2563EB] transition-colors hover:text-[#0EA5E9]"
                >
                  {t("auth.login.forgot")}
                </Link>
              </motion.div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 font-medium text-center bg-red-50 rounded-xl py-2.5 px-4 border border-red-100">
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <motion.div custom={3} variants={formFieldVariants} initial="hidden" animate="visible">
                <Button
                  type="submit"
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-base font-semibold text-white shadow-lg shadow-[#2563EB]/25 transition-all hover:shadow-xl hover:shadow-[#2563EB]/30"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {t("auth.login.button")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative my-7 flex items-center gap-4"
            >
              <div className="h-px flex-1 bg-white/[0.06]" />
              <span className="text-xs text-white/25">{t("auth.login.orWith")}</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </motion.div>

            {/* Social */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-3"
            >
              <button className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white">
                <Chrome className="h-5 w-5" />
                Google
              </button>
              <button className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm font-medium text-white/70 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white">
                <Github className="h-5 w-5" />
                GitHub
              </button>
            </motion.div>

            {/* Register link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-7 text-center text-sm text-white/35"
            >
              {t("auth.login.noAccount")}{" "}
              <Link href="/register" className="font-semibold text-[#2563EB] transition-colors hover:text-[#0EA5E9]">
                {t("auth.login.register")}
              </Link>
            </motion.p>
          </div>

          {/* Bottom accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] opacity-40"
          />
        </motion.div>
      </div>
    </div>
  )
}
