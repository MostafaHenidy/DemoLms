"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { getAdminUser } from "@/lib/admin-auth"

export default function ProfilePage() {
  const [user, setUser] = useState<ReturnType<typeof getAdminUser>>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setUser(getAdminUser())
    }
  }, [mounted])

  if (!mounted) {
    return <div className="py-12 text-center text-[#94A3B8]">جاري التحميل...</div>
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#94A3B8]">لم يتم العثور على بيانات المستخدم.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">
        الملف الشخصي
      </h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
              <Image
                src={user.avatarUrl || "/user-avatar.png"}
                alt={user.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-[#94A3B8]">
                {user.role === "instructor" ? "مدرب" : "مسؤول"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-[#94A3B8] mb-1">البريد الإلكتروني</p>
            <p className="font-medium">{user.email}</p>
          </div>
          {user.titleAr && (
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">المسمى الوظيفي (عربي)</p>
              <p className="font-medium">{user.titleAr}</p>
            </div>
          )}
          {user.titleEn && (
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">المسمى الوظيفي (إنجليزي)</p>
              <p className="font-medium">{user.titleEn}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-[#94A3B8] mb-1">الحالة</p>
            <p className="font-medium">{user.status === "active" ? "نشط" : user.status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
