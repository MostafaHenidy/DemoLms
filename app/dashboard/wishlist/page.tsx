"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { coursesData } from "@/lib/data"

export default function WishlistPage() {
  const { locale, dir, t } = useI18n()
  const { wishlist, toggleWishlist } = useStore()
  const currency = locale === "ar" ? "ج.م" : "EGP"
  const wishlistCourses = coursesData.filter((c) => wishlist.includes(c.id))

  return (
    <div dir={dir}>
      <h2 className="text-2xl font-bold mb-6">{t("dashboard.wishlist")}</h2>

      {wishlistCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-[20px] border border-border p-12 text-center"
        >
          <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">{t("dashboard.emptyWishlist")}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t("dashboard.addToWishlist")}</p>
          <Link href="/courses">
            <Button className="bg-gradient-to-r from-[#2563EB] to-[#0EA5E9] text-white">
              {locale === "ar" ? "تصفح الدورات" : "Browse Courses"}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[20px] border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-44">
                  <Image
                    src={course.thumbnail}
                    alt={locale === "ar" ? course.titleAr : course.titleEn}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => toggleWishlist(course.id)}
                    className="absolute top-3 end-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-1">
                    {locale === "ar" ? course.titleAr : course.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {locale === "ar" ? course.instructorAr : course.instructorEn}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({course.students.toLocaleString("en-US")} {locale === "ar" ? "طالب" : "students"})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-lg">
                      {course.price === 0
                        ? locale === "ar" ? "مجاني" : "Free"
                        : `${course.price} ${currency}`}
                    </span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" variant="outline" className="rounded-xl gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {locale === "ar" ? "عرض" : "View"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
