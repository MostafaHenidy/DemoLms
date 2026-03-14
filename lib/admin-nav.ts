import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileQuestion,
  Database,
  ClipboardCheck,
  Calculator,
  CreditCard,
  MessageCircle,
  User,
  FolderTree,
  Globe,
  Video,
  BarChart3,
  Bell,
  Image,
  Award,
  Wallet,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  children?: { label: string; path: string }[]
}

export const adminNavItems: NavItem[] = [
  { label: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "المستخدمين", path: "/admin/users", icon: Users },
  { label: "المدرسين", path: "/admin/instructors", icon: User },
  { label: "التصنيفات", path: "/admin/categories", icon: FolderTree },
  { label: "الدول", path: "/admin/countries", icon: Globe },
  {
    label: "الدورات",
    path: "/admin/courses",
    icon: BookOpen,
    children: [
      { label: "جميع الدورات", path: "/admin/courses" },
      { label: "إضافة دورة", path: "/admin/courses/new" },
      { label: "موافقة الدورات", path: "/admin/courses/pending" },
    ],
  },
  { label: "بنك البيانات", path: "/admin/databank", icon: Database },
  {
    label: "الاختبارات",
    path: "/admin/exams",
    icon: FileQuestion,
    children: [
      { label: "جميع الاختبارات", path: "/admin/exams" },
      { label: "إضافة اختبار", path: "/admin/exams/new" },
      { label: "اختبارات الطلاب", path: "/admin/exam-attempts" },
    ],
  },
  {
    label: "الواجبات",
    path: "/admin/homework",
    icon: FileText,
    children: [
      { label: "جميع الواجبات", path: "/admin/homework" },
      { label: "إضافة واجب", path: "/admin/homework/new" },
      { label: "إجابات الطلاب", path: "/admin/homework-submissions" },
    ],
  },
  {
    label: "الجلسات المباشرة",
    path: "/admin/live-sessions",
    icon: Video,
    children: [
      { label: "جميع الجلسات", path: "/admin/live-sessions" },
      { label: "جدولة جلسة", path: "/admin/live-sessions/new" },
    ],
  },
  {
    label: "المدفوعات",
    path: "/admin/payments",
    icon: CreditCard,
    children: [
      { label: "المعاملات", path: "/admin/payments" },
      { label: "الكوبونات", path: "/admin/payments/coupons" },
    ],
  },
  {
    label: "تقارير الإشعارات الشهرية",
    path: "/admin/monthly-notifications-reports",
    icon: Bell,
    children: [
      { label: "إرسال التقارير الشهرية", path: "/admin/monthly-notifications-reports" },
      { label: "الإشعارات", path: "/admin/notifications" },
    ],
  },
  { label: "المحادثات", path: "/admin/chat", icon: MessageCircle },
  { label: "البانرات", path: "/admin/banners", icon: Image },
  { label: "الشهادات", path: "/admin/certificates", icon: Award },
  {
    label: "الحضور والغياب",
    path: "/admin/attendance",
    icon: ClipboardCheck,
    children: [
      { label: "تسجيل حضور", path: "/admin/attendance/register" },
      { label: "سجل الحضور", path: "/admin/attendance" },
      { label: "إدارة الحضور", path: "/admin/attendance/manage" },
    ],
  },
  {
    label: "إدارة المدرسين",
    path: "/admin/teachers",
    icon: Calculator,
    children: [
      { label: "إعدادات الأجر", path: "/admin/teachers/salary-settings" },
      { label: "حساب الأجر", path: "/admin/teachers/salary-calculation" },
      { label: "تقارير المدرسين", path: "/admin/teachers/reports" },
    ],
  },
  {
    label: "الطلاب والمديونيات",
    path: "/admin/students",
    icon: Users,
    children: [
      { label: "الحسابات المالية", path: "/admin/students/financial" },
      { label: "المديونيات", path: "/admin/students/debts" },
      { label: "سداد المديونيات", path: "/admin/students/payments" },
    ],
  },
  {
    label: "إدارة الخزنة",
    path: "/admin/treasury",
    icon: Wallet,
    children: [
      { label: "الخزنات", path: "/admin/treasury" },
      { label: "الإيرادات", path: "/admin/treasury/revenue" },
      { label: "المصروفات", path: "/admin/treasury/expenses" },
      { label: "سجل الحركات", path: "/admin/treasury/transactions" },
    ],
  },
  {
    label: "التقارير",
    path: "/admin/financial-reports",
    icon: BarChart3,
    children: [
      { label: "لوحة التحكم المالية", path: "/admin/financial-reports" },
      { label: "التقارير اليومية", path: "/admin/financial-reports/daily" },
      { label: "التقارير الشهرية", path: "/admin/financial-reports/monthly" },
      { label: "تقارير الطلاب", path: "/admin/financial-reports/students" },
      { label: "تقارير المدرسين", path: "/admin/financial-reports/teachers" },
      { label: "التقارير العامة", path: "/admin/financial-reports" },
    ],
  },
  { label: "إعدادات التطبيق", path: "/admin/settings", icon: Settings },
]

export const instructorNavItems: NavItem[] = [
  { label: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "دوراتي",
    path: "/admin/courses",
    icon: BookOpen,
    children: [
      { label: "جميع دوراتي", path: "/admin/courses" },
      { label: "إضافة دورة", path: "/admin/courses/new" },
    ],
  },
  { label: "طلابي", path: "/admin/my-students", icon: Users },
  { label: "امتحانات طلابي", path: "/admin/exam-attempts", icon: FileQuestion },
  { label: "واجبات الطلاب", path: "/admin/homework-submissions", icon: FileText },
  { label: "بنك البيانات", path: "/admin/databank", icon: Database },
  {
    label: "الحضور",
    path: "/admin/teacher/attendance",
    icon: ClipboardCheck,
    children: [
      { label: "تسجيل حضور", path: "/admin/attendance/register" },
      { label: "سجل الحضور", path: "/admin/teacher/attendance" },
    ],
  },
  {
    label: "الأجر والعمولات",
    path: "/admin/teacher/salary/settings",
    icon: Calculator,
    children: [
      { label: "إعدادات الأجر", path: "/admin/teacher/salary/settings" },
      { label: "حساب الأجر", path: "/admin/teacher/salary/calculation" },
      { label: "تقاريري المالية", path: "/admin/teacher/salary/reports" },
    ],
  },
  { label: "مبيعاتي", path: "/admin/my-sales", icon: CreditCard },
  { label: "المحادثات", path: "/admin/chat", icon: MessageCircle },
  { label: "الملف الشخصي", path: "/admin/profile", icon: User },
]
