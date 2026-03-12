"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { BookOpen, Users, Star, Sparkles, Award, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.9) * 45,
  y: 50 + Math.cos(i * 0.7) * 45,
  size: 2 + (i % 2) + 0.5,
  duration: 5 + (i % 3) + 2,
  delay: i % 3,
}))

const gradients = [
  "from-[#2563EB] to-[#3B82F6]",
  "from-[#0EA5E9] to-[#38BDF8]",
  "from-[#8B5CF6] to-[#A78BFA]",
  "from-[#F59E0B] to-[#FBBF24]",
]

const glowColors = [
  "rgba(37, 99, 235, 0.2)",
  "rgba(14, 165, 233, 0.2)",
  "rgba(139, 92, 246, 0.2)",
  "rgba(245, 158, 11, 0.2)",
]

type Instructor = {
  id: number
  nameAr: string
  nameEn: string
  titleAr: string
  titleEn: string
  avatar: string
  courses: number
  students: number
  rating: number
}

export default function InstructorsSection() {
  const { locale, t } = useI18n()

  const [instructors, setInstructors] = useState<Instructor[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchInstructors = async () => {
      try {
        const res = await fetch("/api/instructors")
        if (!res.ok) return

        const data: Instructor[] = await res.json()
        if (isMounted) {
          setInstructors(data)
        }
      } catch (error) {
        console.error("Failed to load instructors", error)
      }
    }

    fetchInstructors()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 70% 30%, rgba(37, 99, 235, 0.05) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 25% 75%, rgba(14, 165, 233, 0.04) 0%, transparent 50%), linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #FFFFFF 100%)",
          }}
        />
        <motion.div
          className="absolute -top-32 start-[-8%] h-[450px] w-[450px] rounded-full bg-[#2563EB]/[0.04] blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 end-[-6%] h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/[0.04] blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#2563EB]/12"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -20, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating decorative */}
      <motion.div
        className="pointer-events-none absolute end-[7%] top-[10%] hidden h-12 w-12 rounded-2xl border border-[#8B5CF6]/10 bg-[#8B5CF6]/5 shadow-md lg:block"
        animate={{ y: [0, -14, 0], rotate: [0, 5, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full items-center justify-center">
          <Award className="h-5 w-5 text-[#8B5CF6]/50" />
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute start-[5%] bottom-[15%] hidden h-10 w-10 rounded-full border border-amber-200/30 bg-amber-50/50 shadow-sm lg:block"
        animate={{ y: [0, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex h-full items-center justify-center">
          <Star className="h-4 w-4 text-amber-400/50" />
        </div>
      </motion.div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-16 text-center lg:mb-20"
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
            {t("instructors.title")}
          </motion.div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
            {t("instructors.subtitle")}
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-[#64748B] sm:text-lg">
            {locale === "ar"
              ? "تعلّم على أيدي أفضل الخبراء في مجالاتهم مع سنوات من الخبرة العملية"
              : "Learn from the best experts in their fields with years of practical experience"}
          </p>
        </motion.div>

        {/* Instructor cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {instructors.map((instructor, i) => {
            const name = locale === "ar" ? instructor.nameAr : instructor.nameEn
            const title = locale === "ar" ? instructor.titleAr : instructor.titleEn
            const grad = gradients[i % gradients.length]
            const glow = glowColors[i % glowColors.length]

            return (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -10, transition: { duration: 0.3, ease: "easeOut" } }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0]/80 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.05)] transition-all duration-500 hover:border-[#2563EB]/15 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.12)]"
              >
                {/* Top gradient band */}
                <div className={`h-24 bg-gradient-to-r ${grad} relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  />
                  {/* Decorative circles */}
                  <div className="absolute -top-4 -end-4 h-16 w-16 rounded-full bg-white/10" />
                  <div className="absolute -bottom-2 -start-2 h-10 w-10 rounded-full bg-white/10" />
                </div>

                {/* Avatar */}
                <div className="flex justify-center -mt-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.12, ease: "backOut" }}
                    className="relative"
                  >
                    <div
                      className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-lg transition-shadow duration-300 group-hover:shadow-xl"
                      style={{ boxShadow: `0 8px 24px -6px ${glow}` }}
                    >
                      <Image
                        src={instructor.avatar}
                        alt={name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    {/* Online dot */}
                    <motion.div
                      className="absolute -bottom-0.5 -end-0.5 h-5 w-5 rounded-full border-[3px] border-white bg-emerald-400"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-4 text-center">
                  <h3 className="mb-1 text-lg font-bold text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
                    {name}
                  </h3>
                  <p className="mb-4 text-sm font-medium text-[#64748B]">{title}</p>

                  {/* Rating */}
                  <div className="mb-4 flex items-center justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.12 + idx * 0.05, duration: 0.3, ease: "backOut" }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            idx < Math.round(instructor.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-[#E2E8F0] text-[#E2E8F0]"
                          }`}
                        />
                      </motion.div>
                    ))}
                    <span className="ms-1.5 text-sm font-bold text-[#0F172A]">{instructor.rating}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center gap-5 rounded-2xl bg-[#F8FAFC] px-4 py-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span className="text-base font-bold text-[#0F172A]">{instructor.courses}</span>
                      </div>
                      <p className="text-[10px] font-medium text-[#94A3B8]">{t("instructors.coursesCount")}</p>
                    </div>
                    <div className="h-8 w-px bg-[#E2E8F0]" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3.5 w-3.5 text-[#0EA5E9]" />
                        <span className="text-base font-bold text-[#0F172A]">{(instructor.students / 1000).toFixed(1)}K</span>
                      </div>
                      <p className="text-[10px] font-medium text-[#94A3B8]">{t("instructors.studentsCount")}</p>
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                <motion.div
                  className="absolute end-4 top-28 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                >
                  <ArrowUpRight className="h-4 w-4 text-[#2563EB]" />
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
