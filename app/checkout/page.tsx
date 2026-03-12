"use client"

import { useState, useEffect, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CreditCard,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Phone,
  Sparkles,
  Smartphone,
  Wallet,
  Banknote,
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { coursesData } from "@/lib/data"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AnimatedPageHero } from "@/components/ui/animated-page-hero"

type PaymentMethod = "credit-card" | "fawry" | "vodafone-cash" | "bank-transfer"

interface FormFields {
  name: string
  email: string
  phone: string
  cardNumber: string
  expiry: string
  cvv: string
  fawryPhone: string
  vodafoneNumber: string
}

const emptyForm: FormFields = {
  name: "",
  email: "",
  phone: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  fawryPhone: "",
  vodafoneNumber: "",
}

export default function CheckoutPage() {
  const { locale, dir, t } = useI18n()
  const { cart, cartTotal, appliedCoupon, checkout: storeCheckout, isLoggedIn, user } = useStore()
  const router = useRouter()
  const isRTL = dir === "rtl"

  useEffect(() => {
    if (!isLoggedIn) router.push("/login")
  }, [isLoggedIn, router])

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/profile?userId=${user.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setForm((prev) => ({
            ...prev,
            name: data.user.name ?? prev.name,
            email: data.user.email ?? prev.email,
            phone: data.user.phone ?? prev.phone,
          }))
        }
      })
      .catch(() => {})
  }, [user?.id])

  const mockCartItems = cart
    .map((item) => coursesData.find((c) => c.id === item.courseId))
    .filter(Boolean) as (typeof coursesData)[number][]

  const [form, setForm] = useState<FormFields>(() => ({
    ...emptyForm,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  }))
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit-card")
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({})
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const updateField = (field: keyof FormFields, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const markTouched = (field: keyof FormFields) =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const getRequiredFields = (): (keyof FormFields)[] => {
    const base: (keyof FormFields)[] = ["name", "email", "phone"]
    switch (paymentMethod) {
      case "credit-card":
        return [...base, "cardNumber", "expiry", "cvv"]
      case "fawry":
        return [...base, "fawryPhone"]
      case "vodafone-cash":
        return [...base, "vodafoneNumber"]
      default:
        return base
    }
  }

  const requiredFields = getRequiredFields()

  const isFieldInvalid = (field: keyof FormFields) =>
    touched[field] && !form[field].trim()

  const isFormValid = requiredFields.every((f) => form[f].trim())

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const allTouched: Partial<Record<keyof FormFields, boolean>> = {}
    requiredFields.forEach((f) => { allTouched[f] = true })
    setTouched(allTouched)
    if (!isFormValid) return
    setProcessing(true)
    const ok = await storeCheckout()
    setProcessing(false)
    if (ok) {
      setSuccess(true)
    }
  }

  const subtotal = cartTotal
  const discount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? Math.round(subtotal * (appliedCoupon.discountValue / 100))
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0
  const total = subtotal - discount
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  const inputCls = (field: keyof FormFields) =>
    cn(
      "h-12 rounded-xl border-[#E2E8F0] bg-[#F8FAFC] transition-all focus:bg-white focus:border-[#2563EB] focus:ring-[#2563EB]/20",
      isFieldInvalid(field) && "border-red-300 bg-red-50/50 focus:border-red-400"
    )

  const paymentMethods: { value: PaymentMethod; labelAr: string; labelEn: string; icon: typeof CreditCard; color: string; description: string }[] = [
    {
      value: "credit-card",
      labelAr: "بطاقة ائتمان",
      labelEn: "Credit Card",
      icon: CreditCard,
      color: "from-[#2563EB] to-[#3B82F6]",
      description: locale === "ar" ? "Visa, Mastercard" : "Visa, Mastercard",
    },
    {
      value: "fawry",
      labelAr: "فوري",
      labelEn: "Fawry",
      icon: Banknote,
      color: "from-[#F59E0B] to-[#F97316]",
      description: locale === "ar" ? "ادفع من أقرب فرع" : "Pay at nearest branch",
    },
    {
      value: "vodafone-cash",
      labelAr: "فودافون كاش",
      labelEn: "Vodafone Cash",
      icon: Smartphone,
      color: "from-[#DC2626] to-[#EF4444]",
      description: locale === "ar" ? "من محفظتك الإلكترونية" : "From your e-wallet",
    },
    {
      value: "bank-transfer",
      labelAr: "تحويل بنكي",
      labelEn: "Bank Transfer",
      icon: Building2,
      color: "from-[#059669] to-[#10B981]",
      description: locale === "ar" ? "تحويل مباشر" : "Direct transfer",
    },
  ]

  return (
    <div dir={dir} className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <AnimatedPageHero
        badge={locale === "ar" ? "إتمام الشراء" : "Secure Checkout"}
        title={t("checkout.title")}
        subtitle={locale === "ar" ? "أكمل بياناتك لإتمام عملية الشراء بأمان" : "Complete your information to finish your purchase securely"}
        compact
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white py-24 shadow-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-xl shadow-emerald-500/30"
              >
                <CheckCircle2 className="h-12 w-12 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-2 text-2xl font-bold text-[#0F172A]"
              >
                {locale === "ar" ? "تم تأكيد الطلب!" : "Order Confirmed!"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8 text-[#64748B]"
              >
                {locale === "ar"
                  ? paymentMethod === "fawry"
                    ? "سيتم إرسال كود الدفع على هاتفك. قم بالدفع في أقرب فرع فوري."
                    : "شكراً لك. ستتلقى بريداً إلكترونياً بتفاصيل طلبك."
                  : paymentMethod === "fawry"
                    ? "A payment code will be sent to your phone. Pay at any Fawry branch."
                    : "Thank you. You'll receive an email with your order details."}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Link href="/courses">
                  <Button size="lg" className="gap-2 rounded-xl bg-[#2563EB] px-8 text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8]">
                    {t("cart.browseCourses")}
                    <ArrowIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="checkout-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-8 lg:grid-cols-3"
            >
              {/* Form Column */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-sm text-[#94A3B8]"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">1</span>
                    <span className="font-medium text-[#0F172A] text-xs sm:text-sm truncate">{t("checkout.personalInfo")}</span>
                    <div className="h-px flex-1 min-w-[20px] bg-[#E2E8F0]" />
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">2</span>
                    <span className="font-medium text-[#0F172A] text-xs sm:text-sm truncate">{t("checkout.paymentMethod")}</span>
                  </motion.div>

                  {/* Personal Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10">
                        <User className="h-5 w-5 text-[#2563EB]" />
                      </div>
                      <h2 className="text-lg font-bold text-[#0F172A]">{t("checkout.personalInfo")}</h2>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.name")}</Label>
                        <div className="relative">
                          <User className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <Input value={form.name} onChange={(e) => updateField("name", e.target.value)} onBlur={() => markTouched("name")} placeholder={t("checkout.name")} dir={dir} className={cn(inputCls("name"), "ps-10")} />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.email")}</Label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} onBlur={() => markTouched("email")} placeholder={t("checkout.email")} dir="ltr" className={cn(inputCls("email"), "ps-10")} />
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.phone")}</Label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <Input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} onBlur={() => markTouched("phone")} placeholder={t("checkout.phone")} dir="ltr" className={cn(inputCls("phone"), "ps-10")} />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Payment Method */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="rounded-2xl border border-[#E2E8F0]/80 bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10">
                        <Wallet className="h-5 w-5 text-[#2563EB]" />
                      </div>
                      <h2 className="text-lg font-bold text-[#0F172A]">{t("checkout.paymentMethod")}</h2>
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((method) => (
                        <Label
                          key={method.value}
                          htmlFor={method.value}
                          className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition-all",
                            paymentMethod === method.value
                              ? "border-[#2563EB] bg-[#2563EB]/5 shadow-[0_4px_16px_-4px_rgba(37,99,235,0.15)]"
                              : "border-[#E2E8F0] hover:border-[#2563EB]/30"
                          )}
                        >
                          <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white transition-all",
                            paymentMethod === method.value ? method.color : "from-[#F1F5F9] to-[#E2E8F0] text-[#94A3B8] !text-[#64748B]"
                          )}>
                            <method.icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-[#0F172A]">
                              {locale === "ar" ? method.labelAr : method.labelEn}
                            </span>
                            <span className="text-xs text-[#94A3B8]">{method.description}</span>
                          </div>
                          {paymentMethod === method.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB]"
                            >
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </Label>
                      ))}
                    </RadioGroup>

                    <AnimatePresence mode="wait">
                      {/* Credit Card Fields */}
                      {paymentMethod === "credit-card" && (
                        <motion.div
                          key="credit-card-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                              <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.cardNumber")}</Label>
                              <div className="relative">
                                <CreditCard className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                <Input value={form.cardNumber} onChange={(e) => updateField("cardNumber", e.target.value)} onBlur={() => markTouched("cardNumber")} placeholder="0000 0000 0000 0000" dir="ltr" className={cn(inputCls("cardNumber"), "ps-10 font-mono tracking-widest")} />
                              </div>
                            </div>
                            <div>
                              <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.expiry")}</Label>
                              <Input value={form.expiry} onChange={(e) => updateField("expiry", e.target.value)} onBlur={() => markTouched("expiry")} placeholder="MM / YY" dir="ltr" className={cn(inputCls("expiry"), "font-mono tracking-widest")} />
                            </div>
                            <div>
                              <Label className="mb-2 block text-sm font-medium text-[#64748B]">{t("checkout.cvv")}</Label>
                              <div className="relative">
                                <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                <Input value={form.cvv} onChange={(e) => updateField("cvv", e.target.value)} onBlur={() => markTouched("cvv")} placeholder="•••" dir="ltr" className={cn(inputCls("cvv"), "ps-10 font-mono tracking-widest")} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Fawry Fields */}
                      {paymentMethod === "fawry" && (
                        <motion.div
                          key="fawry-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 space-y-4">
                            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] text-white">
                                  <Banknote className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-[#0F172A]">
                                    {locale === "ar" ? "الدفع عبر فوري" : "Pay via Fawry"}
                                  </h4>
                                  <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                                    {locale === "ar"
                                      ? "سيتم إنشاء كود دفع فوري وإرساله على رقم هاتفك. قم بالتوجه إلى أقرب فرع فوري أو استخدم تطبيق فوري لإتمام الدفع خلال 48 ساعة."
                                      : "A Fawry payment code will be generated and sent to your phone number. Visit any Fawry outlet or use the Fawry app to complete payment within 48 hours."}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="mb-2 block text-sm font-medium text-[#64748B]">
                                {locale === "ar" ? "رقم الهاتف لاستقبال كود فوري" : "Phone number for Fawry code"}
                              </Label>
                              <div className="relative">
                                <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                <Input
                                  type="tel"
                                  value={form.fawryPhone}
                                  onChange={(e) => updateField("fawryPhone", e.target.value)}
                                  onBlur={() => markTouched("fawryPhone")}
                                  placeholder="01xxxxxxxxx"
                                  dir="ltr"
                                  className={cn(inputCls("fawryPhone"), "ps-10 font-mono")}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Vodafone Cash Fields */}
                      {paymentMethod === "vodafone-cash" && (
                        <motion.div
                          key="vodafone-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 space-y-4">
                            <div className="rounded-xl border border-red-200/60 bg-red-50/50 p-4">
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] text-white">
                                  <Smartphone className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-[#0F172A]">
                                    {locale === "ar" ? "الدفع عبر فودافون كاش" : "Pay via Vodafone Cash"}
                                  </h4>
                                  <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
                                    {locale === "ar"
                                      ? "سيتم إرسال طلب دفع على محفظة فودافون كاش الخاصة بك. قم بتأكيد الدفع من خلال تطبيق فودافون كاش أو عبر كود *9*"
                                      : "A payment request will be sent to your Vodafone Cash wallet. Confirm the payment through the Vodafone Cash app or via *9* code."}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="mb-2 block text-sm font-medium text-[#64748B]">
                                {locale === "ar" ? "رقم فودافون كاش" : "Vodafone Cash number"}
                              </Label>
                              <div className="relative">
                                <Smartphone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                                <Input
                                  type="tel"
                                  value={form.vodafoneNumber}
                                  onChange={(e) => updateField("vodafoneNumber", e.target.value)}
                                  onBlur={() => markTouched("vodafoneNumber")}
                                  placeholder="010xxxxxxxx"
                                  dir="ltr"
                                  className={cn(inputCls("vodafoneNumber"), "ps-10 font-mono")}
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Mobile submit */}
                  <div className="lg:hidden">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="h-12 w-full gap-2 rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8]"
                    >
                      {processing ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{t("checkout.processing")}</>
                      ) : (
                        <>{t("checkout.placeOrder")}<ArrowIcon className="h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <div className="overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] px-6 py-6">
                      <h2 className="text-lg font-bold text-white">{t("checkout.orderSummary")}</h2>
                      <p className="mt-1 text-sm text-white/70">{mockCartItems.length} {locale === "ar" ? "دورات" : "courses"}</p>
                    </div>

                    <div className="p-6 space-y-4">
                      {mockCartItems.map((item, idx) => (
                        <div key={item.id}>
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                              <Image src={item.thumbnail} alt={locale === "ar" ? item.titleAr : item.titleEn} fill unoptimized className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#0F172A]">
                                {locale === "ar" ? item.titleAr : item.titleEn}
                              </p>
                              <p className="mt-0.5 text-sm font-bold text-[#2563EB]">
                                {item.price} {t("bestCourses.currency")}
                              </p>
                            </div>
                          </div>
                          {idx < mockCartItems.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#64748B]">{t("checkout.subtotal")}</span>
                          <span className="font-semibold text-[#0F172A]">{subtotal} {t("bestCourses.currency")}</span>
                        </div>
                        {appliedCoupon && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-emerald-600">
                                {t("cart.discount")}{" "}
                                {appliedCoupon.discountType === "percentage"
                                  ? `(${appliedCoupon.discountValue}%)`
                                  : `(${appliedCoupon.code})`}
                              </span>
                              <span className="font-semibold text-emerald-600">-{discount} {t("bestCourses.currency")}</span>
                            </div>
                            <Separator />
                          </>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[#0F172A]">{t("checkout.total")}</span>
                          <span className="text-2xl font-extrabold text-[#2563EB]">{total} {t("bestCourses.currency")}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={processing}
                        onClick={handleSubmit}
                        className="hidden h-12 w-full gap-2 rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.4)] transition-all hover:bg-[#1D4ED8] lg:flex"
                      >
                        {processing ? (
                          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{t("checkout.processing")}</>
                        ) : (
                          <>{t("checkout.placeOrder")}<ArrowIcon className="h-4 w-4" /></>
                        )}
                      </Button>

                      {/* Payment method indicator */}
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <div className="flex items-center gap-2.5">
                          {paymentMethods.find(m => m.value === paymentMethod) && (() => {
                            const method = paymentMethods.find(m => m.value === paymentMethod)!
                            return (
                              <>
                                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white", method.color)}>
                                  <method.icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0F172A]">
                                    {locale === "ar" ? "طريقة الدفع" : "Payment Method"}
                                  </p>
                                  <p className="text-[10px] text-[#94A3B8]">
                                    {locale === "ar" ? method.labelAr : method.labelEn}
                                  </p>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>{locale === "ar" ? "دفع آمن" : "Secure"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <Lock className="h-3.5 w-3.5" />
                          <span>{locale === "ar" ? "مشفّر" : "Encrypted"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{locale === "ar" ? "ضمان" : "Guarantee"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Footer />
    </div>
  )
}
