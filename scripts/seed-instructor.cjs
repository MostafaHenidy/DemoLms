/* Seed an instructor user for testing the teacher dashboard */

require("dotenv").config()
const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const { PrismaMariaDb } = require("@prisma/adapter-mariadb")

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "instructor@anmka.com"
  const password = "instructor123"
  const passwordHash = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "instructor", passwordHash, titleAr: "مدرب", titleEn: "Instructor" },
    })
    console.log(`Updated existing user to instructor: ${email}`)
  } else {
    await prisma.user.create({
      data: {
        name: "مدرب تجريبي",
        email,
        passwordHash,
        role: "instructor",
        titleAr: "مدرب",
        titleEn: "Instructor",
      },
    })
    console.log(`Created instructor: ${email} / ${password}`)
  }

  console.log("Login at /admin/login with:", email, "/", password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
