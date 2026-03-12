"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, TrendingUp, Calendar, FileText } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

type BillingTransaction = {
  id: number
  date: string
  courseId: number | null
  titleAr: string
  titleEn: string
  amount: number
  status: "paid"
}

export default function BillingPage() {
  const { locale, dir, t } = useI18n()
  const { user, isLoggedIn } = useStore()
  const currency = locale === "ar" ? "ج.م" : "EGP"

  const [totalSpent, setTotalSpent] = useState(0)
  const [activeCourses, setActiveCourses] = useState(0)
  const [lastPurchase, setLastPurchase] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<BillingTransaction[]>([])

  useEffect(() => {
    const fetchBilling = async () => {
      if (!user || !isLoggedIn) return
      const userIdNum = Number(user.id)
      if (!userIdNum || Number.isNaN(userIdNum)) return
      try {
        const res = await fetch(`/api/dashboard/billing?userId=${userIdNum}`)
        if (!res.ok) return
        const data = await res.json()
        if (typeof data.totalSpent === "number") setTotalSpent(data.totalSpent)
        if (typeof data.activeCourses === "number") setActiveCourses(data.activeCourses)
        if (typeof data.lastPurchase === "string" || data.lastPurchase === null) {
          setLastPurchase(data.lastPurchase)
        }
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions)
        }
      } catch {
        // ignore
      }
    }
    fetchBilling()
  }, [user, isLoggedIn])

  const summaryCards = [
    {
      label: locale === "ar" ? "إجمالي الإنفاق" : "Total Spent",
      value: `${totalSpent} ${currency}`,
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: locale === "ar" ? "الدورات النشطة" : "Active Courses",
      value: String(activeCourses),
      icon: CreditCard,
      color: "from-green-500 to-green-600",
    },
    {
      label: locale === "ar" ? "آخر عملية شراء" : "Last Purchase",
      value:
        lastPurchase ??
        (locale === "ar" ? "لا توجد عمليات شراء بعد" : "No purchases yet"),
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
    },
  ]

  return (
    <div dir={dir}>
      <h2 className="text-2xl font-bold mb-6">{t("dashboard.billingHistory")}</h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {summaryCards.map((card) => (
          <motion.div
            key={card.label}
            variants={item}
            className="bg-white rounded-[20px] border border-border p-5 hover:shadow-lg transition-shadow"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-[20px] border border-border overflow-hidden"
      >
        <div className="p-5 border-b border-border">
          <h3 className="font-bold">{locale === "ar" ? "سجل المعاملات" : "Transaction History"}</h3>
        </div>

        <div className="divide-y divide-border">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {locale === "ar" ? tx.titleAr : tx.titleEn}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{tx.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-sm">{tx.amount} {currency}</span>
                <Badge
                  variant={tx.status === "paid" ? "default" : "secondary"}
                  className={
                    tx.status === "paid"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                  }
                >
                  {t(`dashboard.${tx.status}`)}
                </Badge>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  {t("dashboard.invoice")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
