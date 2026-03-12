"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useI18n } from "@/lib/i18n"
import { testimonialsData } from "@/lib/data"
import { Button } from "@/components/ui/button"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  )
}

function TestimonialCard({
  testimonial,
  locale,
}: {
  testimonial: (typeof testimonialsData)[0]
  locale: string
}) {
  const isAr = locale === "ar"

  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px 24px -4px_rgba(15,23,42,0.06)]">
      <div className="absolute top-6 end-6 opacity-20">
        <Quote className="h-10 w-10 text-[#2563EB]" />
      </div>
      <StarRating rating={testimonial.rating} />
      <p className="mt-5 flex-1 text-[15px] leading-relaxed text-[#475569]">
        &ldquo;{isAr ? testimonial.textAr : testimonial.textEn}&rdquo;
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-[#E2E8F0] pt-5">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#2563EB]/15">
          <Image
            src={testimonial.avatar}
            alt={isAr ? testimonial.nameAr : testimonial.nameEn}
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-[#0F172A]">
            {isAr ? testimonial.nameAr : testimonial.nameEn}
          </h4>
          <p className="text-sm text-[#64748B]">
            {isAr ? testimonial.roleAr : testimonial.roleEn}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const { locale, dir, t } = useI18n()
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })
  const [activeIndex, setActiveIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setItemsPerView(1)
      else if (window.innerWidth < 1024) setItemsPerView(2)
      else setItemsPerView(3)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, testimonialsData.length - itemsPerView)

  const scrollNext = useCallback(() => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }, [maxIndex])

  const scrollPrev = useCallback(() => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }, [maxIndex])

  useEffect(() => {
    autoPlayRef.current = setInterval(scrollNext, 5000)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [scrollNext])

  const pauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
  }, [])

  const resumeAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    autoPlayRef.current = setInterval(scrollNext, 5000)
  }, [scrollNext])

  const isRtl = dir === "rtl"

  return (
    <section
      ref={sectionRef}
      dir={dir}
      className="relative overflow-hidden py-20 lg:py-28 bg-[#F8FAFC]"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-0 w-72 h-72 rounded-full bg-[#2563EB]/[0.06] blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full bg-[#0EA5E9]/[0.05] blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-[#0F172A] sm:text-4xl">
            {t("testimonials.title")}
          </h2>
          <p className="mx-auto max-w-xl text-base text-[#64748B]">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={pauseAutoPlay}
          onMouseLeave={resumeAutoPlay}
        >
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: isRtl
                  ? `${activeIndex * (100 / itemsPerView + (6 * 4) / itemsPerView)}%`
                  : `-${activeIndex * (100 / itemsPerView + (6 * 4) / itemsPerView)}%`,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              {testimonialsData.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={
                    isInView
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 40 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="shrink-0"
                  style={{
                    width: `calc((100% - ${(itemsPerView - 1) * 24}px) / ${itemsPerView})`,
                  }}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    locale={locale}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isRtl ? scrollNext() : scrollPrev()
              }}
              className="rounded-full w-10 h-10 border-gray-200 hover:border-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#2563EB] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-8 bg-[#2563EB]"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                isRtl ? scrollPrev() : scrollNext()
              }}
              className="rounded-full w-10 h-10 border-gray-200 hover:border-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#2563EB] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
