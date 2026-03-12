"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  CheckCircle2,
  FileText,
  Download,
  StickyNote,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Trophy,
  Sparkles,
  ChevronDown,
  BarChart3,
  MessageSquare,
  Bookmark,
  Share2,
  ThumbsUp,
  Zap,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { coursesData, courseCurriculum } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import CustomVideoPlayer from "@/components/ui/custom-video-player"
import PDFViewer from "@/components/ui/pdf-viewer"

const COURSE_VIDEO_ID = "AevtORdu4pc"

const allLessons = courseCurriculum.flatMap((section) => section.lessons)

function ProgressRing({ value, size = 40, strokeWidth = 3.5 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function LearningPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isPurchased, isLoggedIn } = useStore()
  const { locale, dir, t } = useI18n()
  const isRTL = dir === "rtl"

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return }
    if (id && !isPurchased(id as string)) { router.push(`/courses/${id}`); return }
  }, [isLoggedIn, isPurchased, id, router])

  const course = coursesData.find((c) => c.id === id) ?? coursesData[0]

  const [currentLessonId, setCurrentLessonId] = useState(allLessons[0].id)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noteSaveStatus, setNoteSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [activeTab, setActiveTab] = useState("description")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(courseCurriculum.map((_, i) => i))
  )

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId)
  const currentLesson = allLessons[currentIndex]

  const progressValue = useMemo(
    () => Math.round((completedLessons.size / allLessons.length) * 100),
    [completedLessons]
  )

  const sectionProgress = useMemo(() => {
    return courseCurriculum.map((section) => {
      const completed = section.lessons.filter((l) => completedLessons.has(l.id)).length
      return { completed, total: section.lessons.length, pct: Math.round((completed / section.lessons.length) * 100) }
    })
  }, [completedLessons])

  const goToLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId)
    setNoteSaveStatus("idle")
  }, [])

  const goNext = () => {
    if (currentIndex < allLessons.length - 1) goToLesson(allLessons[currentIndex + 1].id)
  }
  const goPrev = () => {
    if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1].id)
  }

  const toggleComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev)
      if (next.has(lessonId)) next.delete(lessonId)
      else next.add(lessonId)
      return next
    })
  }

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleSaveNote = () => {
    setNoteSaveStatus("saving")
    setTimeout(() => setNoteSaveStatus("saved"), 800)
  }

  const courseTitle = locale === "ar" ? course.titleAr : course.titleEn
  const lessonTitle = locale === "ar" ? currentLesson.titleAr : currentLesson.titleEn

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft
  const NextIcon = isRTL ? ChevronLeft : ChevronRight
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const currentSectionName = (() => {
    const sec = courseCurriculum.find((s) => s.lessons.some((l) => l.id === currentLessonId))
    return sec ? (locale === "ar" ? sec.titleAr : sec.titleEn) : ""
  })()

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC]" dir={dir}>
      {/* Top Bar */}
      <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[#E2E8F0] bg-white px-3 shadow-sm sm:h-16 sm:gap-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl text-[#64748B] hover:bg-[#2563EB]/5 hover:text-[#2563EB] lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <Link
          href={`/courses/${id}`}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
        >
          <BackIcon className="h-4 w-4" />
          <span className="hidden max-w-[150px] truncate sm:inline lg:max-w-[220px]">{courseTitle}</span>
        </Link>

        <div className="mx-2 hidden h-5 w-px bg-[#E2E8F0] sm:block" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="relative flex shrink-0 items-center justify-center">
            <ProgressRing value={progressValue} size={36} strokeWidth={3} />
            <span className="absolute text-[9px] font-bold text-[#2563EB]">{progressValue}%</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 rounded-lg px-2 text-xs text-[#64748B] hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
            disabled={currentIndex === 0}
            onClick={goPrev}
          >
            <PrevIcon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t("learning.prevLesson")}</span>
          </Button>
          <span className="mx-1 text-[10px] font-semibold text-[#94A3B8]">
            {currentIndex + 1}/{allLessons.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 rounded-lg px-2 text-xs text-[#64748B] hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
            disabled={currentIndex === allLessons.length - 1}
            onClick={goNext}
          >
            <span className="hidden md:inline">{t("learning.nextLesson")}</span>
            <NextIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Main layout: sidebar uses CSS logical properties via dir, no flex-row-reverse needed */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar - positioned using logical properties via dir on root */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "min(340px, 85vw)", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-y-0 z-[40] flex w-[340px] max-w-[85vw] flex-col border-e border-[#E2E8F0] bg-white shadow-xl lg:relative lg:z-auto lg:max-w-none lg:shadow-none"
              style={{ [isRTL ? "right" : "left"]: 0 }}
            >
              {/* Sidebar Header */}
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#E2E8F0] px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6]">
                    <Layers className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-[#0F172A]">{t("learning.courseContent")}</h2>
                    <p className="text-[10px] text-[#94A3B8]">{completedLessons.size}/{allLessons.length} {locale === "ar" ? "مكتمل" : "completed"}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-[#94A3B8] hover:bg-[#2563EB]/5 hover:text-[#2563EB] lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Course Mini Card */}
              <div className="border-b border-[#E2E8F0] p-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={course.thumbnail} alt="" fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#0F172A]">{courseTitle}</p>
                    <p className="mt-0.5 text-[10px] text-[#94A3B8]">{locale === "ar" ? course.instructorAr : course.instructorEn}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
                      animate={{ width: `${progressValue}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#2563EB]">{progressValue}%</span>
                </div>
              </div>

              {/* Sections List */}
              <ScrollArea className="flex-1">
                <div className="py-1">
                  {courseCurriculum.map((section, sIdx) => {
                    const isExpanded = expandedSections.has(sIdx)
                    const sp = sectionProgress[sIdx]
                    const sectionHasActive = section.lessons.some((l) => l.id === currentLessonId)

                    return (
                      <div key={sIdx}>
                        <button
                          onClick={() => toggleSection(sIdx)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-3 text-start transition-colors",
                            sectionHasActive ? "bg-[#2563EB]/[0.04]" : "hover:bg-[#F1F5F9]"
                          )}
                        >
                          <div className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                            sp.pct === 100
                              ? "bg-emerald-100 text-emerald-600"
                              : sectionHasActive
                                ? "bg-[#2563EB]/10 text-[#2563EB]"
                                : "bg-[#F1F5F9] text-[#94A3B8]"
                          )}>
                            {sp.pct === 100 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{sIdx + 1}</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs font-semibold truncate", sectionHasActive ? "text-[#0F172A]" : "text-[#64748B]")}>
                              {locale === "ar" ? section.titleAr : section.titleEn}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1 w-14 overflow-hidden rounded-full bg-[#E2E8F0]">
                                <div
                                  className={cn("h-full rounded-full transition-all", sp.pct === 100 ? "bg-emerald-500" : "bg-[#2563EB]")}
                                  style={{ width: `${sp.pct}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-[#94A3B8]">{sp.completed}/{sp.total}</span>
                            </div>
                          </div>
                          <ChevronDown className={cn(
                            "h-3.5 w-3.5 shrink-0 text-[#94A3B8] transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <ul className="pb-1">
                                {section.lessons.map((lesson) => {
                                  const isActive = lesson.id === currentLessonId
                                  const isComplete = completedLessons.has(lesson.id)
                                  return (
                                    <li key={lesson.id}>
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => goToLesson(lesson.id)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goToLesson(lesson.id) } }}
                                        className={cn(
                                          "group flex w-full cursor-pointer items-center gap-3 py-2.5 text-start transition-all",
                                          isRTL ? "pe-4 ps-10" : "ps-10 pe-4",
                                          isActive
                                            ? "bg-[#2563EB]/[0.06] border-e-2 border-[#2563EB]"
                                            : "hover:bg-[#F8FAFC]"
                                        )}
                                      >
                                        <span
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => { e.stopPropagation(); toggleComplete(lesson.id) }}
                                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); toggleComplete(lesson.id) } }}
                                          className={cn(
                                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                                            isComplete
                                              ? "border-emerald-500 bg-emerald-500 text-white"
                                              : isActive
                                                ? "border-[#2563EB] bg-[#2563EB]/10"
                                                : "border-[#D1D5DB] group-hover:border-[#94A3B8]"
                                          )}
                                        >
                                          {isComplete && <CheckCircle className="h-3 w-3" />}
                                          {isActive && !isComplete && <Play className="h-2.5 w-2.5 text-[#2563EB]" fill="currentColor" />}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                          <p className={cn(
                                            "truncate text-xs transition-colors",
                                            isActive ? "font-bold text-[#2563EB]" : isComplete ? "text-[#94A3B8] line-through" : "text-[#475569] group-hover:text-[#0F172A]"
                                          )}>
                                            {locale === "ar" ? lesson.titleAr : lesson.titleEn}
                                          </p>
                                          <div className="mt-0.5 flex items-center gap-1.5">
                                            <Clock className="h-2.5 w-2.5 text-[#CBD5E1]" />
                                            <span className="text-[10px] text-[#CBD5E1]">{lesson.duration}</span>
                                          </div>
                                        </div>

                                        {lesson.free && !isActive && (
                                          <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                                            {locale === "ar" ? "مجاني" : "FREE"}
                                          </span>
                                        )}
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {progressValue >= 50 && (
                <div className="border-t border-[#E2E8F0] p-4">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 px-3 py-2.5">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-[10px] font-bold text-amber-700">{locale === "ar" ? "أنت في منتصف الطريق!" : "Halfway there!"}</p>
                      <p className="text-[9px] text-amber-600/60">{locale === "ar" ? "استمر بالتعلم" : "Keep going!"}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[35] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-y-auto bg-[#F8FAFC]">
          {/* Video Player */}
          <div className="relative w-full bg-[#0a0a0a]">
            <div className="mx-auto max-w-6xl">
              <CustomVideoPlayer
                videoId={COURSE_VIDEO_ID}
                title={lessonTitle}
                onEnded={() => {
                  toggleComplete(currentLessonId)
                  goNext()
                }}
              />
            </div>
          </div>

          {/* Lesson Info Strip */}
          <div className="border-b border-[#E2E8F0] bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#2563EB]/10 px-2.5 py-1 text-[10px] font-bold text-[#2563EB]">
                    {currentSectionName}
                  </span>
                  <span className="text-[10px] text-[#CBD5E1]">•</span>
                  <span className="text-[10px] font-medium text-[#94A3B8]">
                    {locale === "ar" ? `الدرس ${currentIndex + 1} من ${allLessons.length}` : `Lesson ${currentIndex + 1} of ${allLessons.length}`}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-[#0F172A] sm:text-xl">{lessonTitle}</h1>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsLiked(!isLiked)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all",
                    isLiked ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]" : "border-[#E2E8F0] text-[#94A3B8] hover:border-[#2563EB]/30 hover:text-[#2563EB]"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all",
                    isBookmarked ? "border-amber-400 bg-amber-50 text-amber-500" : "border-[#E2E8F0] text-[#94A3B8] hover:border-amber-300 hover:text-amber-500"
                  )}
                >
                  <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                </motion.button>
                <Button
                  size="sm"
                  onClick={() => toggleComplete(currentLessonId)}
                  className={cn(
                    "h-10 gap-2 rounded-xl px-5 text-xs font-bold transition-all",
                    completedLessons.has(currentLessonId)
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/25"
                  )}
                >
                  {completedLessons.has(currentLessonId) ? (
                    <><CheckCircle2 className="h-4 w-4" />{t("learning.completed")}</>
                  ) : (
                    <><Zap className="h-4 w-4" />{t("learning.complete")}</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} dir={dir}>
              <TabsList className="mb-6 w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-[#F1F5F9] p-1.5">
                <TabsTrigger
                  value="description"
                  className="gap-2 rounded-xl text-xs font-semibold text-[#64748B] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("learning.description")}</span>
                  <span className="sm:hidden">{locale === "ar" ? "الوصف" : "Info"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="gap-2 rounded-xl text-xs font-semibold text-[#64748B] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{locale === "ar" ? "المواد التعليمية" : "Materials"}</span>
                  <span className="sm:hidden">PDF</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attachments"
                  className="gap-2 rounded-xl text-xs font-semibold text-[#64748B] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("learning.attachments")}</span>
                  <span className="sm:hidden">{locale === "ar" ? "ملفات" : "Files"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="gap-2 rounded-xl text-xs font-semibold text-[#64748B] data-[state=active]:bg-white data-[state=active]:text-[#2563EB] data-[state=active]:shadow-sm"
                >
                  <StickyNote className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("learning.notes")}</span>
                  <span className="sm:hidden">{locale === "ar" ? "ملاحظات" : "Notes"}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 sm:p-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                      <MessageSquare className="h-4 w-4 text-[#2563EB]" />
                      {locale === "ar" ? "عن هذا الدرس" : "About This Lesson"}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#64748B]">
                      {locale === "ar" ? course.descriptionAr : course.descriptionEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Clock, label: locale === "ar" ? "المدة" : "Duration", value: currentLesson.duration, color: "from-[#2563EB] to-[#3B82F6]" },
                      { icon: Layers, label: locale === "ar" ? "القسم" : "Section", value: currentSectionName, color: "from-[#8B5CF6] to-[#A78BFA]" },
                      { icon: BarChart3, label: t("learning.progress"), value: `${progressValue}%`, color: "from-[#06B6D4] to-[#22D3EE]" },
                      { icon: Trophy, label: locale === "ar" ? "مكتمل" : "Done", value: `${completedLessons.size}/${allLessons.length}`, color: "from-[#F59E0B] to-[#FBBF24]" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-shadow hover:shadow-md"
                      >
                        <div className={cn("mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", stat.color)}>
                          <stat.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-[10px] font-medium text-[#94A3B8]">{stat.label}</p>
                        <p className="mt-0.5 truncate text-sm font-bold text-[#0F172A]">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-semibold transition-all",
                        isBookmarked
                          ? "border-amber-300 bg-amber-50 text-amber-600"
                          : "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]/20 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                      )}
                    >
                      <Bookmark className="h-3.5 w-3.5" fill={isBookmarked ? "currentColor" : "none"} />
                      {locale === "ar" ? "حفظ الدرس" : "Bookmark"}
                    </button>
                    <button className="flex items-center gap-2 rounded-xl border-2 border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#64748B] transition-all hover:border-[#2563EB]/20 hover:bg-[#2563EB]/5 hover:text-[#2563EB]">
                      <Share2 className="h-3.5 w-3.5" />
                      {locale === "ar" ? "مشاركة" : "Share"}
                    </button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="materials" className="mt-0">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <PDFViewer
                    src="/course-material.pdf"
                    title={locale === "ar" ? "المادة التعليمية للدورة" : "Course Study Material"}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="attachments" className="mt-0">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {[
                    { name: locale === "ar" ? "ملفات المشروع" : "Project Files", ext: "ZIP", size: "2.4 MB", color: "from-[#F59E0B] to-[#FBBF24]" },
                    { name: locale === "ar" ? "شرائح العرض" : "Slides", ext: "PDF", size: "1.1 MB", color: "from-[#EF4444] to-[#F87171]" },
                    { name: locale === "ar" ? "ملاحظات الدرس" : "Lesson Notes", ext: "PDF", size: "540 KB", color: "from-[#8B5CF6] to-[#A78BFA]" },
                    { name: locale === "ar" ? "الكود المصدري" : "Source Code", ext: "ZIP", size: "3.2 MB", color: "from-[#06B6D4] to-[#22D3EE]" },
                  ].map((file, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-all hover:border-[#2563EB]/20 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm", file.color)}>
                          <span className="text-[9px] font-black text-white">{file.ext}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">{file.name}</p>
                          <p className="text-[11px] text-[#94A3B8]">{file.size}</p>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#E2E8F0] text-[#94A3B8] transition-all hover:border-[#2563EB] hover:bg-[#2563EB]/10 hover:text-[#2563EB]"
                      >
                        <Download className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <StickyNote className="h-4 w-4 text-[#2563EB]" />
                      <h3 className="text-sm font-bold text-[#0F172A]">{locale === "ar" ? "ملاحظاتك على هذا الدرس" : "Your Notes for This Lesson"}</h3>
                    </div>
                    <Textarea
                      placeholder={t("learning.addNote")}
                      value={notes[currentLessonId] ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [currentLessonId]: e.target.value }))
                      }
                      className="min-h-[200px] resize-none rounded-xl border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] placeholder:text-[#CBD5E1]"
                      dir={dir}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs">
                        {noteSaveStatus === "saving" && <span className="text-[#2563EB] font-medium">{t("learning.savingNote")}</span>}
                        {noteSaveStatus === "saved" && <span className="text-emerald-500 font-medium">{t("learning.noteSaved")}</span>}
                      </p>
                      <Button
                        onClick={handleSaveNote}
                        size="sm"
                        disabled={noteSaveStatus === "saving"}
                        className="h-10 gap-2 rounded-xl bg-[#2563EB] px-5 text-xs font-bold hover:bg-[#1D4ED8] shadow-sm"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {noteSaveStatus === "saving" ? t("learning.savingNote") : noteSaveStatus === "saved" ? t("learning.noteSaved") : t("learning.saveNote")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Bottom Navigation */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#E2E8F0] pb-8 pt-6">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-2 border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 hover:text-[#2563EB]"
                disabled={currentIndex === 0}
                onClick={goPrev}
              >
                <PrevIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("learning.prevLesson")}</span>
              </Button>

              {currentIndex < allLessons.length - 1 && (
                <div className="hidden text-center sm:block">
                  <p className="text-[10px] font-medium text-[#94A3B8]">{locale === "ar" ? "الدرس التالي" : "Up Next"}</p>
                  <p className="mt-0.5 max-w-[200px] truncate text-xs font-semibold text-[#64748B]">
                    {locale === "ar" ? allLessons[currentIndex + 1].titleAr : allLessons[currentIndex + 1].titleEn}
                  </p>
                </div>
              )}

              <Button
                className="gap-2 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/20"
                disabled={currentIndex === allLessons.length - 1}
                onClick={goNext}
              >
                <span className="hidden sm:inline">{t("learning.nextLesson")}</span>
                <NextIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
