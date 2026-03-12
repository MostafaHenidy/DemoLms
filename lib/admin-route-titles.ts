export const adminRouteTitles: Record<string, string> = {
  "/admin/dashboard": "لوحة التحكم",
  "/admin/users": "إدارة المستخدمين",
  "/admin/instructors": "المدرسين",
  "/admin/categories": "التصنيفات",
  "/admin/countries": "الدول",
  "/admin/courses": "الدورات",
  "/admin/courses/pending": "موافقة الدورات",
  "/admin/databank": "بنك البيانات",
  "/admin/exams": "الاختبارات",
  "/admin/exam-attempts": "اختبارات الطلاب",
  "/admin/live-sessions": "الجلسات المباشرة",
  "/admin/payments": "المدفوعات",
  "/admin/payments/coupons": "الكوبونات",
  "/admin/monthly-notifications-reports": "تقارير الإشعارات الشهرية",
  "/admin/notifications": "الإشعارات",
  "/admin/chat": "المحادثات",
  "/admin/banners": "البانرات",
  "/admin/certificates": "الشهادات",
  "/admin/attendance": "إدارة الحضور والغياب",
  "/admin/attendance/register": "تسجيل الحضور",
  "/admin/attendance/manage": "إدارة الحضور",
  "/admin/teachers/salary-settings": "إعدادات أجر المدرسين",
  "/admin/teachers/salary-calculation": "حساب أجر المدرسين",
  "/admin/teachers/reports": "تقارير المدرسين",
  "/admin/teacher/attendance": "سجل الحضور",
  "/admin/teacher/salary/settings": "إعدادات الأجر",
  "/admin/teacher/salary/calculation": "حساب الأجر",
  "/admin/teacher/salary/reports": "تقاريري المالية",
  "/admin/students/financial": "الحسابات المالية للطلاب",
  "/admin/students/debts": "مديونيات الطلاب",
  "/admin/students/payments": "سداد المديونيات",
  "/admin/treasury": "إدارة الخزنة",
  "/admin/treasury/revenue": "الإيرادات",
  "/admin/treasury/expenses": "المصروفات",
  "/admin/treasury/transactions": "سجل الحركات",
  "/admin/financial-reports": "التقارير المالية",
  "/admin/financial-reports/daily": "التقارير اليومية",
  "/admin/financial-reports/monthly": "التقارير الشهرية",
  "/admin/financial-reports/students": "تقارير الطلاب",
  "/admin/financial-reports/teachers": "تقارير المدرسين",
  "/admin/reports": "التقارير والتحليلات",
  "/admin/my-students": "طلابي",
  "/admin/my-sales": "مبيعاتي",
  "/admin/profile": "الملف الشخصي",
  "/admin/settings": "إعدادات التطبيق",
  "/admin/offline-videos": "الفيديوهات المحمّلة",
}

export function getAdminPageTitle(pathname: string): string {
  if (adminRouteTitles[pathname]) return adminRouteTitles[pathname]
  let best = "لوحة التحكم"
  let bestLen = 0
  for (const [path, title] of Object.entries(adminRouteTitles)) {
    if (pathname.startsWith(path + "/") && path.length > bestLen) {
      best = title
      bestLen = path.length
    }
  }
  return best
}
