"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Award, Download, Calendar } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

type CertificateDto = {
  id: number
  courseId: number | null
  titleAr: string
  titleEn: string
  instructorAr: string
  instructorEn: string
  issuedAt: string
  code: string
}

export default function CertificatesPage() {
  const { locale, dir, t } = useI18n()
  const { user, isLoggedIn } = useStore()
  const [certificates, setCertificates] = useState<CertificateDto[]>([])

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user || !isLoggedIn) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/certificates?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.certificates)) {
          setCertificates(data.certificates)
        }
      } catch {
        // ignore
      }
    }
    fetchCertificates()
  }, [user, isLoggedIn])

  return (
    <div dir={dir}>
      <h2 className="text-2xl font-bold mb-6">{t("dashboard.certificates")}</h2>

      <div className="space-y-6">
        {certificates.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-white rounded-[20px] border border-border overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {locale === "ar" ? cert.titleAr : cert.titleEn}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {locale === "ar" ? cert.instructorAr : cert.instructorEn}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {locale === "ar" ? "تاريخ الإصدار:" : "Issued:"} {cert.issuedAt}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? "رقم الشهادة:" : "Certificate #"} {cert.code}
                </p>
              </div>
              <Button className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white gap-2">
                <Download className="w-4 h-4" />
                {t("dashboard.download")}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-muted/50 rounded-[20px] border border-dashed border-border p-8 text-center"
      >
        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">{t("dashboard.completeCourse")}</p>
      </motion.div>
    </div>
  )
}
