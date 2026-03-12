/* Seed script to populate the Course, Instructor, Events and Achievements tables from lib/data.ts */

require("dotenv").config()

const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const { PrismaMariaDb } = require("@prisma/adapter-mariadb")

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = "admin@example.com"
const ADMIN_PASSWORD = "Admin123!"

async function main() {
  // Seed admin account for testing the admin dashboard
  const now = new Date()
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      name: "مدير النظام",
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      updatedAt: now,
    },
    update: { passwordHash: adminHash, updatedAt: now },
  })
  console.log(`Admin account seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  const { coursesData, instructorsData } = require("../lib/data.seed.cjs")

  // Clear existing data to avoid duplicates while developing
  await prisma.payment.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.course.deleteMany()
  await prisma.instructor.deleteMany()

  // Seed root categories
  const rootCategories = [
    { nameAr: "البرمجة", nameEn: "Programming", slug: "programming" },
    { nameAr: "التصميم", nameEn: "Design", slug: "design" },
    { nameAr: "التسويق", nameEn: "Marketing", slug: "marketing" },
    { nameAr: "البيانات", nameEn: "Data", slug: "data" },
    { nameAr: "الأعمال", nameEn: "Business", slug: "business" },
    { nameAr: "اللغات", nameEn: "Language", slug: "language" },
    { nameAr: "عام", nameEn: "General", slug: "general" },
  ]
  for (const c of rootCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...c, order: rootCategories.indexOf(c), updatedAt: new Date() },
      update: { nameAr: c.nameAr, nameEn: c.nameEn, updatedAt: new Date() },
    })
  }
  const categoryMap = {}
  const cats = await prisma.category.findMany({ select: { id: true, slug: true } })
  for (const cat of cats) {
    categoryMap[cat.slug] = cat.id
  }

  await prisma.course.createMany({
    data: coursesData.map((c) => ({
      slug: c.titleEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + c.id,
      titleAr: c.titleAr,
      titleEn: c.titleEn,
      instructorAr: c.instructorAr,
      instructorEn: c.instructorEn,
      rating: c.rating,
      students: c.students,
      price: c.price,
      originalPrice: c.originalPrice,
      category: c.category,
      categoryId: categoryMap[c.category] || null,
      level: c.level,
      hours: c.hours,
      lessons: c.lessons,
      sections: c.sections,
      updatedAt: new Date(c.updatedAt + "-01"),
      coverImageUrl: c.thumbnail || null,
    })),
  })

  // Seed instructors based on instructorsData plus derived stats from coursesData
  await prisma.instructor.createMany({
    data: instructorsData.map((ins) => {
      const relatedCourses = coursesData.filter((c) => c.instructorEn === ins.nameEn)
      const totalStudentsFromCourses = relatedCourses.reduce((sum, c) => sum + c.students, 0)
      const coursesCountFromCourses = relatedCourses.length

      return {
        nameAr: ins.nameAr,
        nameEn: ins.nameEn,
        titleAr: ins.titleAr,
        titleEn: ins.titleEn,
        avatarUrl: ins.avatar,
        coursesCount: coursesCountFromCourses || ins.courses,
        studentsCount: totalStudentsFromCourses || ins.students,
        rating: ins.rating,
      }
    }),
  })

  // Seed default achievements
  await prisma.achievement.deleteMany()
  await prisma.achievement.createMany({
    data: [
      {
        key: "eager-learner",
        titleAr: "متعلم متحمس",
        titleEn: "Eager Learner",
        descriptionAr: "أكمل 7 أيام متتالية",
        descriptionEn: "7 day streak",
        targetStreakDays: 7,
      },
      {
        key: "bookworm",
        titleAr: "قارئ نهم",
        titleEn: "Bookworm",
        descriptionAr: "سجّل في 3 دورات",
        descriptionEn: "Enrolled in 3 courses",
        targetCourses: 3,
      },
      {
        key: "certified-expert",
        titleAr: "خبير معتمد",
        titleEn: "Certified Expert",
        descriptionAr: "احصل على 5 شهادات",
        descriptionEn: "Earn 5 certificates",
        targetCertificates: 5,
      },
    ],
  })

  // Seed upcoming events
  await prisma.event.deleteMany()
  await prisma.event.createMany({
    data: [
      {
        titleAr: "بث مباشر: React المتقدم",
        titleEn: "Live: Advanced React",
        timeLabelAr: "اليوم 3:00م",
        timeLabelEn: "Today 3PM",
      },
      {
        titleAr: "موعد تسليم المشروع",
        titleEn: "Project Deadline",
        timeLabelAr: "غداً 10:00ص",
        timeLabelEn: "Tomorrow 10AM",
      },
    ],
  })

  // Seed global notifications
  await prisma.notification.deleteMany()
  await prisma.notification.createMany({
    data: [
      {
        titleAr: "مرحباً بك في أكاديمية أنمكا",
        titleEn: "Welcome to Anmka Academy",
        bodyAr: "ابدأ رحلتك التعليمية اليوم واستكشف أفضل الدورات.",
        bodyEn: "Start your learning journey today and explore our top courses.",
      },
      {
        titleAr: "عرض محدود على الدورات المميزة",
        titleEn: "Limited offer on featured courses",
        bodyAr: "احصل على خصم خاص عند التسجيل في أكثر من دورة.",
        bodyEn: "Get a special discount when you enroll in multiple courses.",
      },
    ],
  })

  // Seed demo users, enrollments, and payments for admin dashboard stats
  const courses = await prisma.course.findMany({ select: { id: true, price: true, titleAr: true } })
  const studentHash = await bcrypt.hash("Student123!", 10)
  const demoUsers = [
    { name: "طالب تجريبي ١", email: "student1@example.com", passwordHash: studentHash, role: "student" },
    { name: "طالب تجريبي ٢", email: "student2@example.com", passwordHash: studentHash, role: "student" },
    { name: "طالب تجريبي ٣", email: "student3@example.com", passwordHash: studentHash, role: "student" },
    { name: "طالب تجريبي ٤", email: "student4@example.com", passwordHash: studentHash, role: "student" },
    { name: "طالب تجريبي ٥", email: "student5@example.com", passwordHash: studentHash, role: "student" },
  ]
  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, avatarUrl: "/user-avatar.png" },
      update: {},
    })
  }
  const users = await prisma.user.findMany({
    where: { email: { in: demoUsers.map((u) => u.email) } },
    select: { id: true },
  })
  const userIds = users.map((u) => u.id)
  if (userIds.length > 0 && courses.length > 0) {
    const pairs = []
    for (const uid of userIds) {
      for (const c of courses.slice(0, 3)) {
        pairs.push({ userId: uid, courseId: c.id, course: c, userIdx: userIds.indexOf(uid) })
      }
    }
    for (const { userId, courseId, course, userIdx } of pairs.slice(0, 15)) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId },
        update: {},
      })
      await prisma.payment.create({
        data: {
          userId,
          courseId,
          amount: course.price,
          status: "completed",
          itemName: course.titleAr,
          userEmail: demoUsers[userIdx].email,
          userName: demoUsers[userIdx].name,
        },
      })
    }
  }

  console.log("Seeded courses, instructors, achievements, events, notifications, demo users, enrollments and payments.")
  console.log("Admin login: " + ADMIN_EMAIL + " / " + ADMIN_PASSWORD)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

