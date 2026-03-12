"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

function FloatingShape({
  className,
  delay = 0,
}: {
  className: string
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  )
}

export function CTASection() {
  const { locale, dir } = useI18n()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  const isAr = locale === "ar"

  const headline = isAr
    ? "ابدأ رحلة التعلّم اليوم"
    : "Start Your Learning Journey Today"

  const subtitle = isAr
    ? "انضم لآلاف الطلاب وابدأ في تطوير مهاراتك مع أفضل المدربين"
    : "Join thousands of students and start developing your skills with the best instructors"

  const browseCta = isAr ? "تصفح الدورات" : "Browse Courses"
  const startCta = isAr ? "ابدأ التعلّم" : "Start Learning"

  return (
    <section ref={ref} dir={dir} className="py-20 lg:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] shadow-[0_24px 48px -12px_rgba(37,99,235,0.25)]"
      >
        <FloatingShape
          className="w-64 h-64 bg-white/10 -top-20 -start-20 blur-xl"
          delay={0}
        />
        <FloatingShape
          className="w-48 h-48 bg-white/10 top-1/2 end-10 blur-lg"
          delay={1.5}
        />
        <FloatingShape
          className="w-32 h-32 bg-white/5 bottom-10 start-1/3 blur-md"
          delay={3}
        />
        <FloatingShape
          className="w-20 h-20 bg-white/10 top-10 end-1/4 blur-sm"
          delay={2}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="relative z-10 px-8 py-16 sm:px-12 sm:py-20 lg:px-20 lg:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isInView
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.9 }
            }
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-8 border border-white/20"
          >
            <BookOpen className="w-4 h-4" />
            {isAr ? "أكاديمية أنمكا" : "Anmka Academy"}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 max-w-3xl mx-auto leading-tight"
          >
            {headline}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-white text-[#2563EB] hover:bg-white/90 font-semibold px-8 shadow-lg shadow-black/10 group"
            >
              {browseCta}
              <ArrowRight
                className={`w-4 h-4 transition-transform ${
                  isAr
                    ? "me-0 ms-2 group-hover:-translate-x-1 rotate-180"
                    : "ms-0 me-2 group-hover:translate-x-1"
                }`}
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent font-semibold px-8 backdrop-blur-sm"
            >
              {startCta}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
          >
            <span>{isAr ? "دورات متنوعة" : "Diverse Courses"}</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/40" />
            <span>{isAr ? "شهادات معتمدة" : "Accredited Certificates"}</span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/40" />
            <span>{isAr ? "دعم متواصل" : "24/7 Support"}</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
