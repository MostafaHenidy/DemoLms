"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Award, Flame, BookOpen, Star } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"

type AchievementDto = {
  id: number
  key: string
  titleAr: string
  titleEn: string
  descriptionAr?: string | null
  descriptionEn?: string | null
  earned: boolean
}

export default function AchievementsPage() {
  const { locale, dir } = useI18n()
  const { user, isLoggedIn } = useStore()
  const [achievements, setAchievements] = useState<AchievementDto[]>([])

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user || !isLoggedIn) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/achievements?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.achievements)) {
          setAchievements(
            data.achievements.map((a: any) => ({
              id: a.id as number,
              key: a.key as string,
              titleAr: a.titleAr as string,
              titleEn: a.titleEn as string,
              descriptionAr: a.descriptionAr ?? null,
              descriptionEn: a.descriptionEn ?? null,
              earned: Boolean(a.earned),
            })),
          )
        }
      } catch {
        // ignore
      }
    }
    fetchAchievements()
  }, [user, isLoggedIn])

  const mapping: Record<string, { icon: typeof Flame; color: string }> = {
    "eager-learner": { icon: Flame, color: "from-amber-400 to-orange-500" },
    bookworm: { icon: BookOpen, color: "from-[#2563EB] to-[#0EA5E9]" },
    "certified-expert": { icon: Award, color: "from-[#8B5CF6] to-[#A78BFA]" },
  }

  return (
    <div dir={dir} className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0F172A]">
          {locale === "ar" ? "الإنجازات" : "Achievements"}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {locale === "ar"
            ? "تتبّع تقدمك وافتح الشارات بناءً على نشاطك."
            : "Track your progress and unlock badges based on your activity."}
        </p>
      </div>

      <div className="space-y-3">
        {achievements.map((ach, i) => {
          const mapped = mapping[ach.key] ?? {
            icon: Star,
            color: "from-[#94A3B8] to-[#64748B]",
          }
          const Icon = mapped.icon
          const earned = ach.earned
          const label = locale === "ar" ? ach.titleAr : ach.titleEn
          const desc =
            locale === "ar"
              ? ach.descriptionAr ?? ""
              : ach.descriptionEn ?? ""

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-2xl border border-[#E2E8F0]/60 bg-white p-3 ${
                earned ? "" : "opacity-60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mapped.color} ${
                  earned ? "" : "grayscale"
                }`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0F172A]">{label}</p>
                {!!desc && (
                  <p className="text-[11px] text-[#64748B] mt-0.5">{desc}</p>
                )}
              </div>
              <div className="shrink-0 text-xs font-semibold">
                {earned
                  ? locale === "ar"
                    ? "مكتملة"
                    : "Completed"
                  : locale === "ar"
                    ? "قيد التقدم"
                    : "In progress"}
              </div>
            </motion.div>
          )
        })}
        {achievements.length === 0 && (
          <p className="text-sm text-[#94A3B8]">
            {locale === "ar"
              ? "لا توجد إنجازات بعد."
              : "No achievements yet."}
          </p>
        )}
      </div>
    </div>
  )
}

