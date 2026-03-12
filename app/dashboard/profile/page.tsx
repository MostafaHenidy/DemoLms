"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Camera, Check, Lock } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { locale, dir, t } = useI18n()
  const { user, isLoggedIn } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [category, setCategory] = useState("")
  const [parentNumber, setParentNumber] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (!user) return
    setFullName(user.name)
    setEmail(user.email)
    // Phone, city, country, category, parentNumber, bio will be fetched on demand from API in future; keep local only for now.
  }, [user])

  useEffect(() => {
    if (!user) return
    const userIdNum = Number(user.id)
    if (!userIdNum || Number.isNaN(userIdNum)) return
    fetch(`/api/profile?userId=${userIdNum}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          setPhone(data.user.phone ?? "")
          setCity(data.user.city ?? "")
          setCountry(data.user.country ?? "")
          setCategory(data.user.category ?? "")
          setParentNumber(data.user.parentNumber ?? "")
          setBio(data.user.bio ?? "")
        }
      })
      .catch(() => {})
  }, [user])

  const handleSave = async () => {
    if (!user || !isLoggedIn) return
    const userIdNum = Number(user.id)
    if (!userIdNum || Number.isNaN(userIdNum)) return
    setSaving(true)
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdNum,
          name: fullName,
          email,
          phone,
          city,
          country,
          category,
          parentNumber,
          bio,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div dir={dir}>
      <h2 className="text-2xl font-bold mb-6">{t("dashboard.profileSettings")}</h2>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700"
        >
          <Check className="w-5 h-5" />
          <span>{locale === "ar" ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully"}</span>
        </motion.div>
      )}

      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[20px] border border-border p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar || "/user-avatar.png"} />
                <AvatarFallback className="text-2xl">
                  {user?.name?.slice(0, 2).toUpperCase() || "ST"}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -end-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-bold text-lg">{fullName || (locale === "ar" ? "طالب" : "Student")}</h3>
              <p className="text-muted-foreground text-sm">{email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الاسم الكامل" : "Full Name"}</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl h-12"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "رقم الهاتف" : "Phone"}</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-12"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "المدينة" : "City"}</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الدولة" : "Country"}</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-xl h-12"
                placeholder={locale === "ar" ? "اختياري" : "Optional"}
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "التصنيف / المجال" : "Category"}</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl h-12"
                placeholder={locale === "ar" ? "اختياري (مثال: برمجة، تصميم)" : "Optional (e.g. programming, design)"}
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "رقم ولي الأمر" : "Parent Number"}</Label>
              <Input
                type="tel"
                value={parentNumber}
                onChange={(e) => setParentNumber(e.target.value)}
                className="rounded-xl h-12"
                dir="ltr"
                placeholder={locale === "ar" ? "اختياري" : "Optional"}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{locale === "ar" ? "نبذة عنك" : "Bio"}</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white px-8"
            >
              {saving
                ? locale === "ar" ? "جاري الحفظ..." : "Saving..."
                : t("dashboard.save")}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[20px] border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-bold text-lg">{locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>{locale === "ar" ? "كلمة المرور الحالية" : "Current Password"}</Label>
              <Input type="password" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "كلمة المرور الجديدة" : "New Password"}</Label>
              <Input type="password" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
              <Input type="password" className="rounded-xl h-12" />
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" className="rounded-xl">
              {locale === "ar" ? "تحديث كلمة المرور" : "Update Password"}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
