import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("adminAccessToken")?.value

    if (!token?.startsWith("user-")) {
      return NextResponse.json({ error: "Instructor only" }, { status: 403 })
    }

    const id = parseInt(token.replace("user-", ""), 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const settings = await prisma.teacherSalarySettings.findUnique({
      where: { teacherId: id },
    })

    if (!settings) {
      return NextResponse.json({
        settings: null,
        message: "لم يتم تعيين إعدادات الأجر بعد. تواصل مع مسؤول النظام.",
      })
    }

    return NextResponse.json({
      settings: {
        workType: settings.workType,
        calculationMethod: settings.calculationMethod,
        fixedAmount: settings.fixedAmount,
        percentage: settings.percentage,
        fixedBaseAmount: settings.fixedBaseAmount,
        percentageOnTop: settings.percentageOnTop,
      },
    })
  } catch (error) {
    console.error("Salary settings error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
