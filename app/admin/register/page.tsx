"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const orbs = [
  { x: "15%", y: "20%", size: 350, color: "rgba(14, 165, 233, 0.14)", delay: 0, duration: 13 },
  { x: "70%", y: "65%", size: 300, color: "rgba(37, 99, 235, 0.12)", delay: 2, duration: 15 },
  { x: "45%", y: "10%", size: 220, color: "rgba(139, 92, 246, 0.07)", delay: 5, duration: 11 },
  { x: "90%", y: "40%", size: 180, color: "rgba(14, 165, 233, 0.06)", delay: 3, duration: 17 },
]

const floatingParticles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.6) * 45,
  y: 50 + Math.cos(i * 0.5) * 45,
  size: 1.5 + (i % 2) + 0.5,
  duration: 6 + (i % 4) + 2,
  delay: i % 5,
}))

const formFieldVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const features = [
  { icon: BookOpen, label: "إنشاء دوراتك" },
  { icon: Users, label: "وصول لآلاف الطلاب" },
  { icon: Award, label: "شهادات معتمدة" },
  { icon: TrendingUp, label: "عمولات على المبيعات" },
]

export default function AdminRegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }
    if (!agreed) {
      setError("يجب الموافقة على الشروط والأحكام")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "فشل إنشاء الحساب")
        return
      }
      router.push("/admin/login?registered=1")
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen" dir="rtl">
      <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#030712]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 20% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 45%)",
          }}
        />
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
              x: [0, i % 2 === 0 ? -40 : 40, 0],
              y: [0, i % 2 === 0 ? 30 : -30, 0],
            }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {floatingParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white/20"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
        <motion.div
          className="absolute -top-[20%] end-[25%] h-[140%] w-px rotate-[-25deg] bg-gradient-to-b from-transparent via-[#0EA5E9]/10 to-transparent"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-[20%] end-[55%] h-[140%] w-px rotate-[-25deg] bg-gradient-to-b from-transparent via-[#2563EB]/8 to-transparent"
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed top-6 right-6 z-50"
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          العودة للموقع الرئيسي
        </Link>
      </motion.div>

      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 items-center justify-center lg:flex">
        <div className="relative z-10 px-14 text-center">
          <motion.div className="relative mx-auto mb-10" style={{ width: 180, height: 180 }}>
            <motion.div
              className="absolute inset-0 rounded-full border border-[#0EA5E9]/25"
              animate={{ rotate: -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-dashed border-[#2563EB]/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-[#8B5CF6]/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#0EA5E9]/20 to-[#2563EB]/20 backdrop-blur-xl">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? "#0EA5E9" : i % 3 === 1 ? "#2563EB" : "#8B5CF6",
                  boxShadow: `0 0 10px ${i % 3 === 0 ? "#0EA5E9" : i % 3 === 1 ? "#2563EB" : "#8B5CF6"}`,
                  top: "50%",
                  left: "50%",
                }}
                animate={{
                  x: [Math.cos((i * Math.PI) / 3) * 85, Math.cos((i * Math.PI) / 3 + Math.PI * 2) * 85],
                  y: [Math.sin((i * Math.PI) / 3) * 85, Math.sin((i * Math.PI) / 3 + Math.PI * 2) * 85],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
              />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white">
              انضم كمدرب
            </h1>
            <p className="mx-auto max-w-sm text-lg leading-relaxed text-white/50">
              أنشئ دوراتك وشارك معرفتك مع آلاف الطلاب
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: "backOut" }}
                whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.15)" }}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm transition-all"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                  <feat.icon className="h-4.5 w-4.5 text-[#0EA5E9]" />
                </div>
                <span className="text-xs font-medium text-white/50">{feat.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-10 flex items-center justify-center gap-6"
          >
            {[
              { label: "تسجيل مجاني" },
              { label: "بدون رسوم" },
              { label: "عمولات على المبيعات" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                className="flex items-center gap-1.5"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400/60" />
                <span className="text-xs text-white/30">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative z-10 flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
            <div className="pointer-events-none absolute -top-24 start-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#0EA5E9]/10 blur-[80px]" />
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0EA5E9]/40 to-transparent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-7 text-center"
            >
              <motion.div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#0EA5E9]/20 to-[#2563EB]/20 lg:hidden"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <GraduationCap className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                إنشاء حساب مدرب
              </h1>
              <p className="text-sm text-white/40">سجّل وانضم كمدرب في المنصة</p>
            </motion.div>

            <form className="space-y-4" onSubmit={handleRegister}>
              <motion.div custom={0} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-white/60">
                  الاسم الكامل
                </Label>
                <div className="relative">
                  <User
                    className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "name" ? "text-[#0EA5E9]" : "text-white/25"
                    }`}
                  />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="الاسم الكامل"
                    className="h-11 border-white/[0.08] bg-white/[0.03] ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#0EA5E9]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#0EA5E9]/20"
                  />
                </div>
              </motion.div>

              <motion.div custom={1} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-white/60">
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Mail
                    className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === "email" ? "text-[#0EA5E9]" : "text-white/25"
                    }`}
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="example@email.com"
                    className="h-11 border-white/[0.08] bg-white/[0.03] ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#0EA5E9]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#0EA5E9]/20"
                  />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.div custom={2} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-white/60">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                        focusedField === "password" ? "text-[#0EA5E9]" : "text-white/25"
                      }`}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••"
                      className="h-11 border-white/[0.08] bg-white/[0.03] pe-10 ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#0EA5E9]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#0EA5E9]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </motion.div>

                <motion.div custom={3} variants={formFieldVariants} initial="hidden" animate="visible" className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/60">
                    تأكيد كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300 ${
                        focusedField === "confirm" ? "text-[#0EA5E9]" : "text-white/25"
                      }`}
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••"
                      className="h-11 border-white/[0.08] bg-white/[0.03] pe-10 ps-11 text-white placeholder:text-white/20 transition-all duration-300 focus:border-[#0EA5E9]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#0EA5E9]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                    >
                      {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </motion.div>
              </div>

              <motion.div custom={4} variants={formFieldVariants} initial="hidden" animate="visible" className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-0.5 border-white/20 data-[state=checked]:bg-[#0EA5E9] data-[state=checked]:border-[#0EA5E9]"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-relaxed text-white/40">
                  أوافق على{" "}
                  <Link href="#" className="font-semibold text-[#0EA5E9] transition-colors hover:text-[#2563EB]">
                    الشروط والأحكام
                  </Link>
                </Label>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 font-medium text-center bg-red-500/10 rounded-xl py-2.5 px-4 border border-red-500/20"
                >
                  {error}
                </motion.p>
              )}

              <motion.div custom={5} variants={formFieldVariants} initial="hidden" animate="visible" className="pt-1">
                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] text-base font-semibold text-white shadow-lg shadow-[#0EA5E9]/25 transition-all hover:shadow-xl hover:shadow-[#0EA5E9]/30"
                >
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب مدرب"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </Button>
              </motion.div>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-center text-sm text-white/35"
            >
              لديك حساب بالفعل؟{" "}
              <Link href="/admin/login" className="font-semibold text-[#0EA5E9] transition-colors hover:text-[#2563EB]">
                تسجيل الدخول
              </Link>
            </motion.p>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] opacity-40"
          />
        </motion.div>
      </div>
    </div>
  )
}
