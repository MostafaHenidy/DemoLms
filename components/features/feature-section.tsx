"use client"

import { motion } from "framer-motion"
import { BookOpen, Infinity as InfinityIcon, Award, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const features = [
  {
    key: "interactive",
    icon: BookOpen,
    gradient: "from-[#2563EB] to-[#3B82F6]",
    bgGlow: "bg-[#2563EB]/10",
    glowColor: "rgba(37, 99, 235, 0.15)",
  },
  {
    key: "lifetime",
    icon: InfinityIcon,
    gradient: "from-[#0EA5E9] to-[#38BDF8]",
    bgGlow: "bg-[#0EA5E9]/10",
    glowColor: "rgba(14, 165, 233, 0.15)",
  },
  {
    key: "certificates",
    icon: Award,
    gradient: "from-[#8B5CF6] to-[#A78BFA]",
    bgGlow: "bg-[#8B5CF6]/10",
    glowColor: "rgba(139, 92, 246, 0.15)",
  },
]

// Deterministic values to avoid hydration mismatch (Math.random differs server vs client)
const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: 50 + Math.sin(i * 0.8) * 45,
  y: 50 + Math.cos(i * 0.6) * 45,
  size: 2 + (i % 2) + 0.5,
  duration: 5 + (i % 3) + 2,
  delay: i % 3,
}))

export default function FeatureSection() {
  const { t, locale } = useI18n()

  return (
    <section className="relative overflow-hidden bg-[#FAFBFC] py-24 lg:py-32">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 60%), linear-gradient(180deg, #FAFBFC 0%, #F0F4FA 50%, #FAFBFC 100%)",
          }}
        />
        <motion.div
          className="absolute -top-40 start-[-10%] h-[500px] w-[500px] rounded-full bg-[#2563EB]/[0.05] blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 end-[-8%] h-[400px] w-[400px] rounded-full bg-[#0EA5E9]/[0.05] blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#2563EB]/15"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -25, 0], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
          />
        ))}
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(37, 99, 235, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

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
            {locale === "ar" ? "مميزاتنا" : "Our Advantages"}
          </motion.div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl lg:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-[#64748B] sm:text-lg">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                className="group relative overflow-hidden rounded-3xl border border-[#E2E8F0]/80 bg-white p-8 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] transition-shadow duration-500 hover:border-[#2563EB]/20 hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] sm:p-10"
              >
                {/* Glow on hover */}
                <div
                  className="pointer-events-none absolute -top-20 -end-20 h-40 w-40 rounded-full opacity-0 blur-[60px] transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: feature.glowColor }}
                />

                {/* Animated corner accent */}
                <motion.div
                  className="pointer-events-none absolute -top-1 -end-1 h-20 w-20"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  <svg viewBox="0 0 80 80" className="h-full w-full">
                    <motion.path
                      d="M 80 0 L 80 80 L 0 80"
                      fill="none"
                      stroke="rgba(37, 99, 235, 0.1)"
                      strokeWidth="1"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.15, ease: "easeInOut" }}
                    />
                  </svg>
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.15, ease: "backOut" }}
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  style={{ boxShadow: `0 8px 24px -4px ${feature.glowColor}` }}
                >
                  <Icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Number */}
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 0.06 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="pointer-events-none absolute end-6 top-6 select-none text-6xl sm:text-8xl font-black text-[#0F172A]"
                >
                  0{i + 1}
                </motion.span>

                {/* Content */}
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="mb-3 text-xl font-bold text-[#0F172A] sm:text-2xl"
                >
                  {t(`features.${feature.key}.title`)}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  className="text-sm leading-relaxed text-[#64748B] sm:text-base"
                >
                  {t(`features.${feature.key}.desc`)}
                </motion.p>

                {/* Bottom accent line */}
                <motion.div
                  className={`absolute bottom-0 start-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
