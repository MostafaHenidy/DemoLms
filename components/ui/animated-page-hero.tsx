"use client"

import { motion } from "framer-motion"
import { Sparkles, BookOpen, GraduationCap, Star, TrendingUp } from "lucide-react"
import { type ReactNode } from "react"

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.6) * 45,
  y: 50 + Math.cos(i * 0.4) * 45,
  size: 2 + (i % 2) + 1,
  duration: 5 + (i % 3) + 2,
  delay: i % 3,
}))

const textReveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface AnimatedPageHeroProps {
  badge?: string
  title: string
  subtitle?: string
  children?: ReactNode
  compact?: boolean
  dark?: boolean
}

export function AnimatedPageHero({
  badge,
  title,
  subtitle,
  children,
  compact = false,
  dark = false,
}: AnimatedPageHeroProps) {
  const bg = dark
    ? "bg-gradient-to-br from-[#0F172A] via-[#1E3A5F] to-[#2563EB]"
    : "bg-[#FAFBFC]"
  const textColor = dark ? "text-white" : "text-[#0F172A]"
  const subtitleColor = dark ? "text-white/70" : "text-[#64748B]"
  const badgeStyle = dark
    ? "border-white/20 bg-white/10 text-white backdrop-blur-sm"
    : "border-[#2563EB]/20 bg-white/90 text-[#2563EB] shadow-[0_4px_16px_-2px_rgba(37,99,235,0.12)] backdrop-blur-sm"
  const particleColor = dark ? "bg-white/20" : "bg-[#2563EB]/20"
  const orbColor1 = dark ? "bg-white/[0.05]" : "bg-[#2563EB]/[0.08]"
  const orbColor2 = dark ? "bg-white/[0.04]" : "bg-[#0EA5E9]/[0.07]"
  const gridOpacity = dark ? "opacity-[0.04]" : "opacity-[0.025]"
  const gridColor = dark ? "rgba(255,255,255,1)" : "rgba(37, 99, 235, 1)"
  const iconColor1 = dark ? "text-white/40" : "text-[#2563EB]/60"
  const iconColor2 = dark ? "text-white/30" : "text-[#0EA5E9]/60"
  const iconBorder1 = dark ? "border-white/10 bg-white/10" : "border-[#2563EB]/15 bg-white/90"
  const iconBorder2 = dark ? "border-white/10 bg-white/10" : "border-[#0EA5E9]/20 bg-white/90"
  const lineColor1 = dark ? "#ffffff" : "#2563EB"
  const lineColor2 = dark ? "#ffffff" : "#0EA5E9"

  return (
    <section className={`relative overflow-hidden ${bg} ${compact ? "pt-28 pb-16" : "pt-28 pb-20"}`}>
      {/* Multi-layer animated background */}
      <div className="pointer-events-none absolute inset-0">
        {!dark && (
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 30% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 55%),
                radial-gradient(ellipse 60% 50% at 75% 80%, rgba(14, 165, 233, 0.08) 0%, transparent 55%),
                linear-gradient(180deg, #FAFBFC 0%, #F0F4FA 100%)
              `,
            }}
          />
        )}

        {/* Animated gradient orbs */}
        <motion.div
          className={`absolute -top-32 start-[-8%] h-[450px] w-[450px] rounded-full ${orbColor1} blur-[120px]`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -bottom-20 end-[-6%] h-[400px] w-[400px] rounded-full ${orbColor2} blur-[100px]`}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4], x: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${particleColor}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              y: [0, -30, 0],
              x: [0, p.id % 2 === 0 ? 15 : -15, 0],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}

        {/* Grid pattern */}
        <div
          className={`absolute inset-0 ${gridOpacity}`}
          style={{
            backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Floating decorative icons */}
      <motion.div
        className={`pointer-events-none absolute end-[8%] top-[15%] hidden h-14 w-14 rounded-2xl border shadow-xl backdrop-blur-md lg:block ${iconBorder1}`}
        animate={{ y: [0, -20, 0], rotate: [0, 6, -3, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full items-center justify-center">
          <BookOpen className={`h-6 w-6 ${iconColor1}`} />
        </div>
      </motion.div>
      <motion.div
        className={`pointer-events-none absolute start-[6%] top-[25%] hidden h-12 w-12 rounded-2xl border shadow-lg backdrop-blur-md lg:block ${iconBorder2}`}
        animate={{ y: [0, 15, 0], rotate: [0, -5, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <div className="flex h-full items-center justify-center">
          <GraduationCap className={`h-5 w-5 ${iconColor2}`} />
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute end-[18%] bottom-[18%] hidden h-11 w-11 rounded-full border border-amber-200 bg-amber-50/80 shadow-md lg:block"
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

      {/* Dashed lines */}
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" style={{ opacity: dark ? 0.06 : 0.05 }}>
        <motion.line
          x1="8%" y1="25%" x2="92%" y2="75%"
          stroke={lineColor1} strokeWidth="1" strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.8, ease: "easeInOut" }}
        />
        <motion.line
          x1="88%" y1="20%" x2="12%" y2="80%"
          stroke={lineColor2} strokeWidth="1" strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 1.2, ease: "easeInOut" }}
        />
      </svg>

      {/* Main content */}
      <motion.div className="container relative mx-auto px-4" initial="hidden" animate="visible">
        <div className="mx-auto max-w-3xl text-center">
          {badge && (
            <motion.div
              variants={textReveal}
              custom={0}
              className={`mb-6 inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold ${badgeStyle}`}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              {badge}
            </motion.div>
          )}

          <motion.h1
            variants={textReveal}
            custom={1}
            className={`mb-5 text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl ${textColor}`}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              variants={textReveal}
              custom={2}
              className={`mx-auto max-w-xl text-lg leading-relaxed ${subtitleColor}`}
            >
              {subtitle}
            </motion.p>
          )}

          {children && (
            <motion.div variants={textReveal} custom={3} className="mt-8">
              {children}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
