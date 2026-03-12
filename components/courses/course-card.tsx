"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Users, Clock, PlayCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"

export interface CourseData {
  id: string
  thumbnail: string
  titleAr: string
  titleEn: string
  instructorAr: string
  instructorEn: string
  instructorAvatar: string
  rating: number
  students: number
  price: number
  originalPrice: number
  category: string
  level: string
  hours: number
  lessons: number
  sections: number
}

interface CourseCardProps {
  course: CourseData
}

export default function CourseCard({ course }: CourseCardProps) {
  const { locale, dir, t } = useI18n()
  const { addToCart, isInCart, isPurchased } = useStore()

  const title = locale === "ar" ? course.titleAr : course.titleEn
  const instructor = locale === "ar" ? course.instructorAr : course.instructorEn
  const isFree = course.price === 0
  const isDiscounted =
    !isFree && course.originalPrice > 0 && course.originalPrice > course.price
  const currency = t("bestCourses.currency")
  const isRTL = dir === "rtl"

  const levelLabels: Record<string, string> = {
    beginner: t("singleCourse.beginner"),
    intermediate: t("singleCourse.intermediate"),
    advanced: t("singleCourse.advanced"),
  }
  const levelLabel = levelLabels[course.level] ?? course.level

  return (
    <motion.article
      whileHover={{ y: -8, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 hover:border-[#2563EB]/20 hover:shadow-[0_24px_48px_-12px_rgba(37,99,235,0.15)]"
    >
      {/* Image */}
      <Link
        href={`/courses/${course.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[#F1F5F9]"
      >
        <Image
          src={course.thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-xl backdrop-blur-sm">
            <PlayCircle className="h-7 w-7 text-[#2563EB]" fill="currentColor" />
          </span>
        </div>

        {/* Badges - top */}
        <div className="absolute start-3 top-3 flex flex-wrap gap-2">
          <Badge className="border-0 bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#0F172A] shadow-sm backdrop-blur-sm">
            {t(`coursesPage.categories.${course.category}`)}
          </Badge>
          <Badge className="border-0 bg-[#0F172A]/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {levelLabel}
          </Badge>
        </div>

        {/* Duration - bottom left on image */}
        <div className="absolute bottom-3 start-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Clock className="h-3.5 w-3.5" />
          {course.hours}h
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/courses/${course.id}`} className="block flex-1">
          <h3 className="mb-4 line-clamp-2 text-lg font-bold leading-snug text-[#0F172A] transition-colors group-hover:text-[#2563EB]">
            {title}
          </h3>
        </Link>

        {/* Instructor */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E2E8F0]">
            <Image
              src={course.instructorAvatar}
              alt={instructor}
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-[#64748B] truncate">
            {instructor}
          </span>
        </div>

        {/* Meta row */}
        <div className="mb-5 flex items-center gap-4 text-sm text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[#0F172A]">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-[#94A3B8]" />
            <span>{course.students.toLocaleString("en-US")}</span>
          </div>
          <span className="text-[#CBD5E1]">·</span>
          <span className="font-medium">{course.lessons} {locale === "ar" ? "درس" : "lessons"}</span>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex flex-col gap-3 border-t border-[#E2E8F0] pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isFree ? (
                <Badge className="border-0 bg-emerald-50 px-3 py-1 font-bold text-emerald-600">
                  {t("bestCourses.free")}
                </Badge>
              ) : (
                <>
                  <span className="text-xl font-bold text-[#2563EB]">
                    {course.price} {currency}
                  </span>
                  {isDiscounted && (
                    <span className="text-sm font-medium text-[#94A3B8] line-through">
                      {course.originalPrice} {currency}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {isPurchased(course.id) ? (
              <Link href={`/learning/${course.id}`} className="flex-1">
                <Button className="w-full h-11 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-semibold gap-2">
                  {locale === "ar" ? "ابدأ التعلم" : "Start Learning"}
                </Button>
              </Link>
            ) : isInCart(course.id) ? (
              <Button disabled variant="outline" className="flex-1 h-11 rounded-xl font-semibold opacity-60">
                {locale === "ar" ? "في السلة ✓" : "In Cart ✓"}
              </Button>
            ) : course.price === 0 ? (
              <Link href={`/courses/${course.id}`} className="flex-1">
                <Button className="w-full h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-semibold gap-2">
                  {t("bestCourses.viewCourse")}
                </Button>
              </Link>
            ) : (
              <>
                <Button onClick={() => addToCart(course.id)} className="flex-1 h-11 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] font-semibold gap-2">
                  {locale === "ar" ? "أضف للسلة" : "Add to Cart"}
                </Button>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline" className="h-11 rounded-xl border-2 border-[#2563EB]/30 text-[#2563EB] hover:bg-[#2563EB]/5 px-3">
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}
