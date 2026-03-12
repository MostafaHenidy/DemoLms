"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Flame,
  Target,
  Zap,
  Star,
  Play,
  Calendar,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { coursesData } from "@/lib/data"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export default function DashboardPage() {
  const { locale, dir, t } = useI18n()
  const { user, isLoggedIn, purchasedCourses } = useStore()
  const router = useRouter()
  const isRTL = dir === "rtl"

  const [enrolledCount, setEnrolledCount] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [totalHours, setTotalHours] = useState(0)
  const [certificatesCount, setCertificatesCount] = useState(0)
  const [activityCounts, setActivityCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  type AchievementDto = {
    id: number
    key: string
    titleAr: string
    titleEn: string
    descriptionAr?: string | null
    descriptionEn?: string | null
    earned: boolean
  }

  const [achievements, setAchievements] = useState<AchievementDto[]>([])
  const [events, setEvents] = useState<
    { id: number; titleAr: string; titleEn: string; timeLabelAr: string; timeLabelEn: string }[]
  >([])
  const [streakDays, setStreakDays] = useState(0)
  const [todayGoal, setTodayGoal] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) router.push("/login")
  }, [isLoggedIn, router])

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/summary?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        if (typeof data.enrolledCount === "number") setEnrolledCount(data.enrolledCount)
        if (typeof data.completedCount === "number") setCompletedCount(data.completedCount)
        if (typeof data.totalHours === "number") setTotalHours(data.totalHours)
        if (typeof data.certificatesCount === "number") setCertificatesCount(data.certificatesCount)
      } catch {
        // ignore summary errors
      }
    }
    fetchSummary()
  }, [user])

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/activity?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.counts) && data.counts.length === 7) {
          setActivityCounts(data.counts)
        }
      } catch {
        // ignore
      }
    }
    fetchActivity()
  }, [user])

  useEffect(() => {
    const fetchAchievementsAndEvents = async () => {
      if (!user) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const [achievementsRes, eventsRes] = await Promise.all([
          fetch(`/api/dashboard/achievements?userId=${userIdNum}`),
          fetch("/api/dashboard/events"),
        ])
        if (achievementsRes.ok) {
          const data = await achievementsRes.json()
          if (Array.isArray(data.achievements)) {
            setAchievements(
              data.achievements.map((a: any) => ({
                id: a.id as number,
                key: a.key as string,
                titleAr: a.titleAr as string,
                titleEn: a.titleEn as string,
                descriptionAr: a.descriptionAr ?? null,
                descriptionEn: a.descriptionEn ?? null,
                earned: Boolean(a.earned),
              })),
            )
          }
          if (typeof data.streakDays === "number") {
            setStreakDays(data.streakDays)
            // Daily goal: progress toward a 7-day streak achievement
            const pct = Math.max(0, Math.min(100, Math.round((data.streakDays / 7) * 100)))
            setTodayGoal(pct)
          }
        }
        if (eventsRes.ok) {
          const data = await eventsRes.json()
          if (Array.isArray(data.events)) {
            setEvents(data.events)
          }
        }
      } catch {
        // ignore
      }
    }
    fetchAchievementsAndEvents()
  }, [user])

  const recentCourses = useMemo(
    () =>
      coursesData
        .filter((c) => purchasedCourses.includes(c.id))
        .slice(0, 4)
        .map((c, i) => ({ ...c, progress: [75, 45, 90, 30][i] ?? 50 })),
    [purchasedCourses]
  )

  const stats = [
    {
      label: locale === "ar" ? "الدورات المسجلة" : "Enrolled",
      value: enrolledCount || purchasedCourses.length,
      icon: BookOpen,
      color: "from-[#2563EB] to-[#3B82F6]",
      bg: "bg-[#2563EB]/5",
    },
    {
      label: locale === "ar" ? "دورات مكتملة" : "Completed",
      value: completedCount,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-400",
      bg: "bg-emerald-500/5",
    },
    {
      label: locale === "ar" ? "ساعات تعلم" : "Hours Learned",
      value: totalHours,
      icon: Clock,
      color: "from-amber-500 to-amber-400",
      bg: "bg-amber-500/5",
    },
    {
      label: locale === "ar" ? "شهادات" : "Certificates",
      value: certificatesCount,
      icon: Award,
      color: "from-[#8B5CF6] to-[#A78BFA]",
      bg: "bg-[#8B5CF6]/5",
    },
  ]

  const weekDays = locale === "ar"
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const activityData = activityCounts

  return (
    <div dir={dir} className="space-y-6">
      {/* Welcome hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-7 sm:p-8 text-white"
      >
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute -top-20 end-[10%] h-[300px] w-[300px] rounded-full bg-[#2563EB]/15 blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-16 start-[5%] h-[250px] w-[250px] rounded-full bg-[#0EA5E9]/10 blur-[80px]"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-2 ring-white/20 shadow-xl">
              <Image src={user?.avatar || "/user-avatar.png"} alt="" fill className="object-cover" />
            </div>
            <div>
              <motion.p
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm text-white/50"
              >
                {locale === "ar" ? "مرحباً بعودتك" : "Welcome back"} 👋
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold sm:text-3xl"
              >
                {user?.name ?? (locale === "ar" ? "طالب" : "Student")}
              </motion.h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 backdrop-blur-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold">{streakDays}</p>
                <p className="text-[10px] text-white/50">{locale === "ar" ? "يوم متتالي" : "Day Streak"}</p>
              </div>
            </motion.div>

            {/* Daily goal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] px-4 py-3 backdrop-blur-sm"
            >
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="url(#goalGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - todayGoal / 100) }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white/60" />
                </div>
              </div>
              <div>
                <p className="text-xl font-extrabold">{todayGoal}%</p>
                <p className="text-[10px] text-white/50">{locale === "ar" ? "هدف اليوم" : "Daily Goal"}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-[#E2E8F0]/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="text-3xl font-extrabold text-[#0F172A]"
            >
              {stat.value}
            </motion.p>
            <p className="text-xs text-[#94A3B8] mt-1 font-medium">{stat.label}</p>
            <div className="pointer-events-none absolute -bottom-4 -end-4 h-20 w-20 rounded-full bg-gradient-to-br opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent courses - 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10">
                <Play className="w-4 h-4 text-[#2563EB]" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                {locale === "ar" ? "استمر في التعلم" : "Continue Learning"}
              </h3>
            </div>
            <Link href="/dashboard/courses">
              <Button variant="ghost" size="sm" className="gap-1.5 text-[#2563EB] hover:bg-[#2563EB]/5 rounded-xl font-semibold">
                {locale === "ar" ? "عرض الكل" : "View All"}
                {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {recentCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-16">
                <BookOpen className="h-12 w-12 text-[#E2E8F0] mb-4" />
                <p className="text-sm text-[#94A3B8] font-medium">
                  {locale === "ar" ? "لم تسجل في أي دورة بعد" : "No courses enrolled yet"}
                </p>
                <Link href="/courses" className="mt-4">
                  <Button size="sm" className="rounded-xl bg-[#2563EB] text-white gap-2">
                    {locale === "ar" ? "تصفح الدورات" : "Browse Courses"}
                  </Button>
                </Link>
              </div>
            ) : (
              recentCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ x: isRTL ? -4 : 4, transition: { duration: 0.2 } }}
                  className="group flex items-center gap-4 rounded-2xl border border-[#E2E8F0]/60 bg-white p-4 shadow-sm transition-all hover:border-[#2563EB]/15 hover:shadow-md"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                    <Image src={course.thumbnail} alt="" fill unoptimized className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                      <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors">
                      {locale === "ar" ? course.titleAr : course.titleEn}
                    </h4>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {locale === "ar" ? course.instructorAr : course.instructorEn}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="h-1.5 flex-1 rounded-full bg-[#F1F5F9] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                          className={`h-full rounded-full ${course.progress >= 80 ? "bg-emerald-500" : "bg-gradient-to-r from-[#2563EB] to-[#0EA5E9]"}`}
                        />
                      </div>
                      <span className={`text-xs font-bold ${course.progress >= 80 ? "text-emerald-500" : "text-[#2563EB]"}`}>
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                  <Link href={`/learning/${course.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25"
                    >
                      {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-5"
        >
          {/* Weekly activity chart */}
          <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-[#0F172A]">
                  {locale === "ar" ? "النشاط الأسبوعي" : "Weekly Activity"}
                </h4>
              </div>
              <span className="text-xs font-medium text-[#94A3B8]">
                {locale === "ar" ? "هذا الأسبوع" : "This Week"}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              {activityData.map((value, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ delay: 0.7 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                    className={`w-full max-w-[28px] rounded-lg ${
                      i === 3 ? "bg-gradient-to-t from-[#2563EB] to-[#0EA5E9] shadow-md shadow-[#2563EB]/20" : "bg-[#F1F5F9] hover:bg-[#2563EB]/10 transition-colors"
                    }`}
                  />
                  <span className={`text-[10px] font-medium ${i === 3 ? "text-[#2563EB] font-bold" : "text-[#94A3B8]"}`}>
                    {weekDays[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8B5CF6]/10">
                <Star className="w-3.5 h-3.5 text-[#8B5CF6]" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">
                {locale === "ar" ? "الإنجازات" : "Achievements"}
              </h4>
            </div>
            <div className="space-y-3">
              {achievements.map((ach, i) => {
                const mapping: Record<string, { icon: typeof Flame; color: string }> = {
                  "eager-learner": { icon: Flame, color: "from-amber-400 to-orange-500" },
                  bookworm: { icon: BookOpen, color: "from-[#2563EB] to-[#0EA5E9]" },
                  "certified-expert": { icon: Award, color: "from-[#8B5CF6] to-[#A78BFA]" },
                }
                const mapped = mapping[ach.key] ?? {
                  icon: Star,
                  color: "from-[#94A3B8] to-[#64748B]",
                }
                const Icon = mapped.icon
                const earned = ach.earned
                const label = locale === "ar" ? ach.titleAr : ach.titleEn
                const desc =
                  locale === "ar"
                    ? ach.descriptionAr ?? ""
                    : ach.descriptionEn ?? ""
                return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    earned ? "bg-[#F8FAFC]" : "bg-[#F8FAFC]/50 opacity-50"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mapped.color} shadow-sm ${!earned && "grayscale"}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0F172A]">{label}</p>
                    <p className="text-[10px] text-[#94A3B8]">{desc}</p>
                  </div>
                  {earned && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                </motion.div>
              )})}
            </div>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl border border-[#E2E8F0]/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h4 className="text-sm font-bold text-[#0F172A]">
                {locale === "ar" ? "الأحداث القادمة" : "Upcoming"}
              </h4>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl border border-[#E2E8F0]/60 p-3"
                >
                  <div className="h-10 w-1 rounded-full bg-gradient-to-b from-[#2563EB] to-[#0EA5E9]" />
                  <div>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {locale === "ar" ? event.titleAr : event.titleEn}
                    </p>
                    <p className="text-[10px] text-[#94A3B8]">
                      {locale === "ar" ? event.timeLabelAr : event.timeLabelEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
