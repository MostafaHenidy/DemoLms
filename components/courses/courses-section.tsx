"use client"

import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, TrendingUp, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { coursesData } from "@/lib/data"
import CourseCard from "./course-card"

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.9) * 45,
  y: 50 + Math.cos(i * 0.7) * 45,
  size: 2 + (i % 2) + 0.5,
  duration: 5 + (i % 3) + 2,
  delay: i % 3,
}))

export default function CoursesSection() {
  const { t, dir, locale } = useI18n()
  const displayedCourses = coursesData.slice(0, 6)
  const isRTL = dir === "rtl"
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-24 lg:py-32">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 20% 30%, rgba(37, 99, 235, 0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(14, 165, 233, 0.05) 0%, transparent 55%), linear-gradient(180deg, #F8FAFC 0%, #F0F4FA 50%, #F8FAFC 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 end-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563EB]/[0.04] blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 start-[-8%] h-[400px] w-[400px] rounded-full bg-[#0EA5E9]/[0.04] blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#2563EB]/15"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating icons */}
      <motion.div
        className="pointer-events-none absolute end-[6%] top-[8%] hidden h-12 w-12 rounded-2xl border border-[#2563EB]/10 bg-white/80 shadow-lg backdrop-blur-sm lg:block"
        animate={{ y: [0, -16, 0], rotate: [0, 5, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full items-center justify-center">
          <BookOpen className="h-5 w-5 text-[#2563EB]/50" />
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute start-[5%] bottom-[12%] hidden h-10 w-10 rounded-xl border border-[#0EA5E9]/10 bg-white/80 shadow-md backdrop-blur-sm lg:block"
        animate={{ y: [0, 12, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex h-full items-center justify-center">
          <TrendingUp className="h-4 w-4 text-[#0EA5E9]/50" />
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute start-[50%] top-[5%] hidden h-11 w-11 rounded-full border border-amber-200/40 bg-amber-50/60 shadow-md lg:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="flex h-full items-center justify-center">
          <GraduationCap className="h-5 w-5 text-amber-400/60" />
        </div>
      </motion.div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="mb-14 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#2563EB]/20 bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#2563EB] shadow-[0_4px_16px_-2px_rgba(37,99,235,0.1)] backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              {locale === "ar" ? "الأكثر شعبية" : "Most Popular"}
            </motion.div>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
              {t("bestCourses.title")}
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-[#64748B] sm:text-lg">
              {t("bestCourses.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              asChild
              className="group h-12 rounded-xl bg-[#2563EB] px-7 text-sm font-bold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8] hover:shadow-[0_8px_28px_-4px_rgba(37,99,235,0.35)]"
            >
              <Link href="/courses" className="flex items-center gap-2">
                {t("bestCourses.viewAll")}
                <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rtl:-translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {displayedCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 text-center lg:mt-16"
        >
          <p className="mb-5 text-sm text-[#64748B]">
            {locale === "ar"
              ? `عرض ${displayedCourses.length} من ${coursesData.length} دورة متاحة`
              : `Showing ${displayedCourses.length} of ${coursesData.length} available courses`}
          </p>
          <Button
            asChild
            variant="outline"
            className="group h-12 rounded-xl border-2 border-[#E2E8F0] px-8 text-sm font-semibold text-[#0F172A] transition-all hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
          >
            <Link href="/courses" className="flex items-center gap-2">
              {locale === "ar" ? "اكتشف جميع الدورات" : "Explore All Courses"}
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rtl:-translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
