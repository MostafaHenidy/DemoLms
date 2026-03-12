"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Star,
  Users,
  Clock,
  PlayCircle,
  Heart,
  ShoppingCart,
  BookOpen,
  Globe,
  BarChart3,
  CalendarDays,
  FileText,
  Download,
  Award,
  Infinity as InfinityIcon,
  CheckCircle2,
  Lock,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { coursesData, courseCurriculum } from "@/lib/data"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { AnimatedPageHero } from "@/components/ui/animated-page-hero"

const MOCK_REVIEWS = [
  {
    id: "r1",
    nameAr: "عبدالله الشمري",
    nameEn: "Abdullah Al-Shammari",
    avatar: "/user-avatar.png",
    rating: 5,
    dateAr: "منذ أسبوعين",
    dateEn: "2 weeks ago",
    textAr:
      "دورة ممتازة! المحتوى واضح ومنظم والمدرب يشرح بطريقة رائعة. أنصح بها بشدة لكل من يريد تعلم هذا المجال.",
    textEn:
      "Excellent course! The content is clear and well-organized, and the instructor explains wonderfully. Highly recommended for anyone wanting to learn this field.",
  },
  {
    id: "r2",
    nameAr: "منى العتيبي",
    nameEn: "Mona Al-Otaibi",
    avatar: "/user-avatar.png",
    rating: 4,
    dateAr: "منذ شهر",
    dateEn: "1 month ago",
    textAr:
      "محتوى غني ومفيد جداً. بعض الدروس كانت تحتاج لشرح أكثر لكن بشكل عام تجربة رائعة.",
    textEn:
      "Rich and very useful content. Some lessons needed more explanation, but overall a great experience.",
  },
  {
    id: "r3",
    nameAr: "فيصل الحربي",
    nameEn: "Faisal Al-Harbi",
    avatar: "/user-avatar.png",
    rating: 5,
    dateAr: "منذ 3 أسابيع",
    dateEn: "3 weeks ago",
    textAr:
      "من أفضل الدورات التي أخذتها. المشاريع العملية ساعدتني كثيراً في فهم المفاهيم بشكل عملي.",
    textEn:
      "One of the best courses I've taken. The practical projects helped me understand concepts in a hands-on way.",
  },
]

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-[${size}px] w-[${size}px] ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  )
}

export default function SingleCoursePage() {
  const { locale, dir, t } = useI18n()
  const params = useParams()
  const courseId = params.id as string

  const course = useMemo(
    () => coursesData.find((c) => c.id === courseId),
    [courseId]
  )

  const [activeTab, setActiveTab] = useState("content")

  if (!course) {
    return (
      <div dir={dir} className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-xl font-bold text-gray-500">
            {t("coursesPage.noResults")}
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  const { addToCart, isInCart, isPurchased, toggleWishlist, isWishlisted } = useStore()
  const router = useRouter()

  const title = locale === "ar" ? course.titleAr : course.titleEn
  const instructor =
    locale === "ar" ? course.instructorAr : course.instructorEn
  const description =
    locale === "ar" ? course.descriptionAr : course.descriptionEn
  const isFree = course.price === 0
  const isDiscounted =
    !isFree && course.originalPrice > 0 && course.originalPrice > course.price
  const currency = t("bestCourses.currency")
  const purchased = isPurchased(course.id)
  const inCart = isInCart(course.id)
  const wishlisted = isWishlisted(course.id)

  const totalLessons = courseCurriculum.reduce(
    (acc, s) => acc + s.lessons.length,
    0
  )

  const levelLabel = t(`singleCourse.${course.level}`)

  return (
    <div dir={dir} className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <AnimatedPageHero
        badge={t(`coursesPage.categories.${course.category}`)}
        title={title}
        subtitle={description}
        dark
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 border-2 border-white/30">
              <AvatarImage src={course.instructorAvatar} />
              <AvatarFallback>{instructor[0]}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-white">{instructor}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString("en-US")} {t("bestCourses.students")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{course.hours} {t("singleCourse.totalHours")}</span>
          </div>
        </div>
      </AnimatedPageHero>

      {/* Content - RTL-aware layout */}
      <div className="container mx-auto px-4 py-10">
        <div className={`flex flex-col gap-8 lg:flex-row ${dir === "rtl" ? "lg:flex-row-reverse" : ""}`}>
          {/* Main content - first on desktop for LTR, second for RTL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 min-w-0 order-2 lg:order-1"
          >
            {/* Stats bar */}
            <div className="mb-6 flex flex-wrap items-center gap-6 rounded-[20px] border border-gray-100 bg-white p-5 shadow-sm" dir={dir}>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-5 w-5 shrink-0 text-[#2563EB]" />
                <span className="font-bold text-gray-800">
                  {courseCurriculum.length}
                </span>{" "}
                {t("singleCourse.sections")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PlayCircle className="h-5 w-5 text-[#2563EB]" />
                <span className="font-bold text-gray-800">{totalLessons}</span>{" "}
                {t("singleCourse.lessons")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-5 w-5 text-[#2563EB]" />
                <span className="font-bold text-gray-800">{course.hours}</span>{" "}
                {t("singleCourse.totalHours")}
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
              dir={dir}
            >
              <TabsList className="mb-6 h-auto w-full justify-start gap-1 rounded-[20px] bg-white p-1.5 shadow-sm">
                <TabsTrigger
                  value="content"
                  className="rounded-2xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
                >
                  {t("singleCourse.courseContent")}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-2xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
                >
                  {t("singleCourse.aboutCourse")}
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="rounded-2xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
                >
                  {t("singleCourse.instructor")}
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="rounded-2xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-[#2563EB] data-[state=active]:text-white"
                >
                  {t("singleCourse.reviews")}
                </TabsTrigger>
              </TabsList>

              {/* Course Content Tab */}
              <TabsContent value="content">
                <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm" dir={dir}>
                  <Accordion
                    type="multiple"
                    defaultValue={["section-0"]}
                    className="space-y-3"
                  >
                    {courseCurriculum.map((section, sIdx) => (
                      <AccordionItem
                        key={sIdx}
                        value={`section-${sIdx}`}
                        className="overflow-hidden rounded-2xl border border-gray-100"
                      >
                        <AccordionTrigger className="px-5 py-4 hover:no-underline">
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-start font-bold text-gray-800 flex-1">
                              {locale === "ar"
                                ? section.titleAr
                                : section.titleEn}
                            </span>
                            <span className="shrink-0 text-xs text-gray-400">
                              {section.lessons.length}{" "}
                              {t("singleCourse.lessons")}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-4">
                          <ul className="space-y-2">
                            {section.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                              >
                                {/* ترتيب RTL: من اليمين لليسار = أيقونة ثم العنوان ثم مجاني ثم المدة */}
                                <div className="flex items-center gap-3 min-w-0 flex-1" dir={dir}>
                                  {lesson.free ? (
                                    <PlayCircle className="h-5 w-5 shrink-0 text-[#2563EB]" />
                                  ) : (
                                    <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                                  )}
                                  <span className="text-sm font-medium text-gray-700 truncate">
                                    {locale === "ar"
                                      ? lesson.titleAr
                                      : lesson.titleEn}
                                  </span>
                                  {lesson.free && (
                                    <Badge className="border-0 bg-emerald-50 text-[10px] font-bold text-emerald-600 shrink-0">
                                      {t("bestCourses.free")}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                                  {lesson.duration}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about">
                <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-gray-800">
                    {t("singleCourse.aboutCourse")}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {description}
                  </p>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                      <BarChart3 className="mx-auto mb-2 h-6 w-6 text-[#2563EB]" />
                      <p className="text-xs text-gray-500">
                        {t("singleCourse.level")}
                      </p>
                      <p className="font-bold text-gray-800">{levelLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                      <Globe className="mx-auto mb-2 h-6 w-6 text-[#2563EB]" />
                      <p className="text-xs text-gray-500">
                        {t("singleCourse.language")}
                      </p>
                      <p className="font-bold text-gray-800">
                        {course.language.toUpperCase()}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                      <CalendarDays className="mx-auto mb-2 h-6 w-6 text-[#2563EB]" />
                      <p className="text-xs text-gray-500">
                        {t("singleCourse.lastUpdated")}
                      </p>
                      <p className="font-bold text-gray-800">
                        {course.updatedAt}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Instructor Tab */}
              <TabsContent value="instructor">
                <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20 border-4 border-[#2563EB]/20">
                      <AvatarImage src={course.instructorAvatar} />
                      <AvatarFallback className="text-xl font-bold">
                        {instructor[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {instructor}
                      </h3>
                      <p className="mb-3 text-sm text-gray-500">
                        {t(`coursesPage.categories.${course.category}`)}{" "}
                        {t("singleCourse.instructor")}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-bold">{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {course.students.toLocaleString("en-US")}{" "}
                            {t("bestCourses.students")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>
                            5 {t("hero.courses")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <p className="leading-relaxed text-gray-600">
                    {locale === "ar"
                      ? "مدرب متمرس بخبرة تزيد عن 10 سنوات في المجال. شغوف بالتعليم ومساعدة الطلاب على تحقيق أهدافهم المهنية. قدّم العديد من الدورات التي حصلت على تقييمات ممتازة من آلاف الطلاب."
                      : "An experienced instructor with over 10 years in the field. Passionate about teaching and helping students achieve their career goals. Has delivered numerous courses that received excellent ratings from thousands of students."}
                  </p>
                </div>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <div className="rounded-[20px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <span className="text-4xl font-extrabold text-gray-800">
                          {course.rating}
                        </span>
                        <div>
                          <StarRating rating={course.rating} size={18} />
                          <p className="mt-0.5 text-xs text-gray-500">
                            ({MOCK_REVIEWS.length} {t("singleCourse.reviews")})
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="rounded-[20px] bg-[#2563EB] font-bold hover:bg-[#1D4ED8]">
                      {t("singleCourse.writeReview")}
                    </Button>
                  </div>

                  {/* Rating breakdown */}
                  <div className="mb-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = MOCK_REVIEWS.filter(
                        (r) => r.rating === star
                      ).length
                      const pct =
                        MOCK_REVIEWS.length > 0
                          ? (count / MOCK_REVIEWS.length) * 100
                          : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex w-12 items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{star}</span>
                          </div>
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="w-10 text-end text-xs text-gray-500">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="my-5" />

                  <div className="space-y-5">
                    {MOCK_REVIEWS.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-gray-50 p-5"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.avatar} />
                              <AvatarFallback>
                                {(locale === "ar"
                                  ? review.nameAr
                                  : review.nameEn)[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-gray-800">
                                {locale === "ar"
                                  ? review.nameAr
                                  : review.nameEn}
                              </p>
                              <p className="text-xs text-gray-400">
                                {locale === "ar"
                                  ? review.dateAr
                                  : review.dateEn}
                              </p>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size={14} />
                        </div>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {locale === "ar" ? review.textAr : review.textEn}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar - sticky purchase card */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:w-[380px] shrink-0 order-1 lg:order-2"
          >
            <div className="sticky top-24 overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-xl">
              <div className="relative aspect-video overflow-hidden lg:hidden">
                <Image src={course.thumbnail} alt={title} fill className="object-cover" sizes="100vw" />
              </div>
              <div className="p-6">
                <div className="mb-5 flex items-baseline gap-3">
                  {isFree ? (
                    <Badge className="border-0 bg-emerald-50 px-4 py-1.5 text-lg font-bold text-emerald-600">
                      {t("bestCourses.free")}
                    </Badge>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-[#2563EB]">
                        {course.price} {currency}
                      </span>
                      {isDiscounted && (
                        <span className="text-lg text-gray-400 line-through">
                          {course.originalPrice} {currency}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {purchased ? (
                  <Link href={`/learning/${course.id}`}>
                    <Button className="mb-3 h-13 w-full rounded-2xl bg-emerald-500 text-base font-bold hover:bg-emerald-600">
                      {locale === "ar" ? "ابدأ التعلم" : "Start Learning"}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      onClick={() => { addToCart(course.id); router.push("/cart") }}
                      className="mb-3 h-13 w-full rounded-2xl bg-[#2563EB] text-base font-bold hover:bg-[#1D4ED8]"
                    >
                      {t("singleCourse.enrollNow")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={inCart}
                      onClick={() => addToCart(course.id)}
                      className="mb-3 h-13 w-full rounded-2xl border-[#2563EB] text-base font-bold text-[#2563EB] hover:bg-[#2563EB]/5 disabled:opacity-60"
                    >
                      <ShoppingCart className="me-2 h-5 w-5" />
                      {inCart ? (locale === "ar" ? "في السلة ✓" : "In Cart ✓") : t("singleCourse.addToCart")}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  onClick={() => toggleWishlist(course.id)}
                  className={cn("h-13 w-full rounded-2xl text-base font-semibold", wishlisted ? "text-rose-500" : "text-gray-600 hover:text-rose-500")}
                >
                  <Heart className={cn("me-2 h-5 w-5", wishlisted && "fill-rose-500")} />
                  {wishlisted ? (locale === "ar" ? "في المفضلة ♥" : "Wishlisted ♥") : t("singleCourse.addToWishlist")}
                </Button>
                <Separator className="my-5" />
                <h4 className="mb-4 text-sm font-bold text-gray-800">{t("singleCourse.includes")}</h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center gap-3">
                    <PlayCircle className="h-5 w-5 shrink-0 text-[#2563EB]" />
                    <span>{course.hours} {t("singleCourse.videoHours")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[#2563EB]" />
                    <span>12 {t("singleCourse.articles")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Download className="h-5 w-5 shrink-0 text-[#2563EB]" />
                    <span>8 {t("singleCourse.resources")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Award className="h-5 w-5 shrink-0 text-[#2563EB]" />
                    <span>{t("singleCourse.certificate")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <InfinityIcon className="h-5 w-5 shrink-0 text-[#2563EB]" />
                    <span>{t("singleCourse.lifetimeAccess")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <Footer />
    </div>
  )
}
