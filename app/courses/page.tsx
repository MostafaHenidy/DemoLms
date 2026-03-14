"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, Grid3X3, LayoutGrid, BookOpen, GraduationCap, Star, Users, Sparkles, TrendingUp, Award } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { coursesData } from "@/lib/data"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import CourseCard, { type CourseData } from "@/components/courses/course-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CATEGORIES = [
  "all",
  "programming",
  "design",
  "business",
  "marketing",
  "data",
  "language",
] as const

type SortOption = "popular" | "newest" | "priceAsc" | "priceDesc" | "rating"

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const heroParticles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.7) * 45,
  y: 50 + Math.cos(i * 0.5) * 45,
  size: 2 + (i % 3) + 0.5,
  duration: 5 + (i % 4) + 2,
  delay: i % 3,
}))

const heroStats = [
  { value: "200+", labelAr: "دورة تعليمية", labelEn: "Courses", icon: BookOpen },
  { value: "50+", labelAr: "مدرب خبير", labelEn: "Expert Instructors", icon: GraduationCap },
  { value: "15K+", labelAr: "طالب مسجل", labelEn: "Students Enrolled", icon: Users },
  { value: "4.8", labelAr: "تقييم عام", labelEn: "Overall Rating", icon: Star },
]

export default function CoursesPage() {
  const { locale, dir, t } = useI18n()

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<SortOption>("popular")
  const [apiCourses, setApiCourses] = useState<CourseData[]>([])

  useEffect(() => {
    fetch("/api/courses?limit=200")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.courses ?? []) as CourseData[]
        const byId = new Map<string, CourseData>()
        list.forEach((c) => byId.set(c.id, c))
        setApiCourses(Array.from(byId.values()))
      })
      .catch(() => setApiCourses([]))
  }, [])

  const sourceCourses = apiCourses.length > 0 ? apiCourses : coursesData

  const filtered = useMemo(() => {
    let result = [...sourceCourses]

    if (category !== "all") {
      result = result.filter((c) => c.category === category)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.titleAr.toLowerCase().includes(q) ||
          c.titleEn.toLowerCase().includes(q) ||
          c.instructorAr.toLowerCase().includes(q) ||
          c.instructorEn.toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case "popular":
        result.sort((a, b) => b.students - a.students)
        break
      case "newest":
        result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        break
      case "priceAsc":
        result.sort((a, b) => a.price - b.price)
        break
      case "priceDesc":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
    }

    return result
  }, [category, search, sort, sourceCourses])

  const textReveal = {
    hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero section with rich animations */}
      <section className="relative overflow-hidden pt-28 pb-24">
        {/* Multi-layer animated background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 30% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 55%),
                radial-gradient(ellipse 60% 50% at 75% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 55%),
                radial-gradient(ellipse 40% 35% at 55% 45%, rgba(37, 99, 235, 0.04) 0%, transparent 50%),
                linear-gradient(180deg, #FAFBFC 0%, #F0F4FA 100%)
              `,
            }}
          />

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute -top-32 start-[-8%] h-[500px] w-[500px] rounded-full bg-[#2563EB]/[0.08] blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
              x: [0, 50, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 end-[-6%] h-[450px] w-[450px] rounded-full bg-[#0EA5E9]/[0.07] blur-[100px]"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-[30%] start-[50%] h-[300px] w-[300px] rounded-full bg-[#2563EB]/[0.04] blur-[80px]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Floating particles */}
          {heroParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#2563EB]/20"
              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
              animate={{
                y: [0, -30, 0],
                x: [0, p.id % 2 === 0 ? 15 : -15, 0],
                opacity: [0, 0.7, 0],
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

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Floating decorative icons */}
        <motion.div
          className="pointer-events-none absolute end-[8%] top-[15%] hidden h-14 w-14 rounded-2xl border border-[#2563EB]/15 bg-white/90 shadow-xl backdrop-blur-md lg:block"
          animate={{ y: [0, -20, 0], rotate: [0, 6, -3, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-6 w-6 text-[#2563EB]/60" />
          </div>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute start-[6%] top-[25%] hidden h-12 w-12 rounded-2xl border border-[#0EA5E9]/20 bg-white/90 shadow-lg backdrop-blur-md lg:block"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <div className="flex h-full items-center justify-center">
            <GraduationCap className="h-5 w-5 text-[#0EA5E9]/60" />
          </div>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute end-[18%] bottom-[20%] hidden h-11 w-11 rounded-full border border-amber-200 bg-amber-50/80 shadow-md lg:block"
          animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <div className="flex h-full items-center justify-center">
            <Star className="h-5 w-5 text-amber-400" />
          </div>
        </motion.div>
        <motion.div
          className="pointer-events-none absolute start-[14%] bottom-[15%] hidden h-10 w-10 rounded-full border border-emerald-200 bg-emerald-50/80 shadow-md lg:block"
          animate={{ y: [0, 10, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="flex h-full items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-500/70" />
          </div>
        </motion.div>

        {/* Animated dashed lines */}
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" style={{ opacity: 0.05 }}>
          <motion.line
            x1="8%" y1="25%" x2="92%" y2="75%"
            stroke="#2563EB" strokeWidth="1" strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
          />
          <motion.line
            x1="88%" y1="20%" x2="12%" y2="80%"
            stroke="#0EA5E9" strokeWidth="1" strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
          />
        </svg>

        {/* Main content */}
        <motion.div
          className="container relative mx-auto px-4"
          initial="hidden"
          animate="visible"
        >
          <div className="mx-auto max-w-3xl text-center">
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
              {locale === "ar" ? "اكتشف أكثر من 200 دورة" : "Discover 200+ Courses"}
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={textReveal}
              custom={1}
              className="mb-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-[#0F172A] md:text-5xl lg:text-6xl"
            >
              {t("coursesPage.title")}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={textReveal}
              custom={2}
              className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-[#64748B]"
            >
              {t("coursesPage.subtitle")}
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={textReveal}
              custom={3}
              className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
              {heroStats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5, ease: "backOut" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] backdrop-blur-sm transition-shadow hover:shadow-[0_8px_28px_-4px_rgba(37,99,235,0.15)]"
                  >
                    <motion.div
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                    >
                      <Icon className="h-5 w-5 text-[#2563EB]" />
                    </motion.div>
                    <div className="text-start">
                      <p className="text-sm font-bold text-[#0F172A]">{stat.value}</p>
                      <p className="text-xs text-[#64748B]">{locale === "ar" ? stat.labelAr : stat.labelEn}</p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Search & filters - premium card */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-[24px] bg-white border border-[#E2E8F0] shadow-xl shadow-[#2563EB]/5 p-6 mb-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("coursesPage.search")}
                className="h-14 rounded-2xl border-[#E2E8F0] bg-[#F8FAFC] ps-12 text-base focus:border-[#2563EB] focus:ring-[#2563EB]/20"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                <SelectTrigger className="h-12 w-full sm:w-[200px] rounded-2xl border-[#E2E8F0] bg-white">
                  <SelectValue placeholder={t("coursesPage.sort")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t("coursesPage.sortOptions.popular")}</SelectItem>
                  <SelectItem value="newest">{t("coursesPage.sortOptions.newest")}</SelectItem>
                  <SelectItem value="priceAsc">{t("coursesPage.sortOptions.priceAsc")}</SelectItem>
                  <SelectItem value="priceDesc">{t("coursesPage.sortOptions.priceDesc")}</SelectItem>
                  <SelectItem value="rating">{t("coursesPage.sortOptions.rating")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Category pills - horizontal scroll on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          <div className="flex gap-2 min-w-max lg:flex-wrap lg:min-w-0">
            {CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <motion.button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30"
                      : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:text-[#2563EB]"
                  }`}
                >
                  {t(`coursesPage.categories.${cat}`)}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        <div className="mb-6 text-sm text-[#64748B]">
          {t("coursesPage.showing")}{" "}
          <span className="font-bold text-[#0F172A]">{filtered.length}</span>{" "}
          {t("coursesPage.of")}{" "}
          <span className="font-bold text-[#0F172A]">{coursesData.length}</span>{" "}
          {t("coursesPage.results")}
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-24 rounded-3xl bg-white border border-[#E2E8F0]"
            >
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#2563EB]/5">
                <Search className="h-10 w-10 text-[#2563EB]" />
              </div>
              <p className="text-xl font-bold text-[#0F172A]">{t("coursesPage.noResults")}</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {filtered.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  )
}
