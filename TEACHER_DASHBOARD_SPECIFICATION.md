# Teacher Dashboard — Full Specification

**Anmka LMS — Instructor/Teacher View**  
This document is a complete specification for rebuilding the teacher (instructor) dashboard from scratch on a separate website/stack.

---

## 1. Overview

### 1.1 Purpose
The teacher dashboard is the **instructor view** within the admin area. Instructors log in at the same `/admin/login` as admins but receive a reduced navigation and data scoped to their own courses, students, attendance, salary, and sales. There is **no separate teacher app** — the teacher dashboard is the instructor role within the admin dashboard.

### 1.2 Architecture
- **Same entry**: `/admin/login` — role check allows `instructor`
- **Same layout**: AdminLayout (Sidebar + Topbar + main)
- **Different nav**: `instructorNavItems` instead of `adminNavItems`
- **Different dashboard**: InstructorOverviewCards (no charts)
- **Scoped data**: All APIs filter by `instructorId` = current user when role is instructor

### 1.3 Tech Stack (Same as Admin)
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS variables (oklch) |
| UI | Radix UI, shadcn-style components |
| Icons | Lucide React |
| Charts | Recharts (not used for instructor dashboard) |
| Toast | Sonner |

### 1.4 Language & Direction
- **Language**: Arabic (ar)
- **Direction**: RTL (`dir="rtl"`)
- **Font**: Cairo

---

## 2. File Structure & Route Map

### 2.1 Teacher-Specific Pages (Instructor Only)

```
app/admin/
├── dashboard/page.tsx              # Uses InstructorOverviewCards when role=instructor
├── courses/page.tsx                # Filtered by instructorId
├── courses/new/page.tsx            # instructorId auto-set to current user
├── courses/[id]/page.tsx           # View own course
├── courses/[id]/edit/page.tsx      # Edit own course
├── courses/[id]/curriculum/page.tsx
├── courses/[id]/lectures/page.tsx
├── my-students/page.tsx            # INSTRUCTOR ONLY — students in instructor's courses
├── my-sales/page.tsx               # INSTRUCTOR ONLY — payments for instructor's courses
├── exam-attempts/page.tsx           # Backend may scope by instructor's courses
├── databank/page.tsx               # Full access (browse, add resources)
├── attendance/register/page.tsx    # Manual attendance — teacherId from course
├── teacher/
│   ├── attendance/page.tsx         # INSTRUCTOR ONLY — own attendance records
│   └── salary/
│       ├── settings/page.tsx       # INSTRUCTOR ONLY — read-only salary settings
│       ├── calculation/page.tsx    # INSTRUCTOR ONLY — calculate own salary
│       └── reports/page.tsx        # INSTRUCTOR ONLY — own salary reports
├── chat/page.tsx                   # Chat with students
└── profile/page.tsx                # INSTRUCTOR ONLY — view own profile
```

### 2.2 Full Teacher Route List

| Route | Page Name (Arabic) | Purpose |
|-------|-------------------|---------|
| `/admin` | — | Redirects to /admin/dashboard |
| `/admin/login` | لوحة تحكم الإدارة | Login (role must be instructor) |
| `/admin/dashboard` | لوحة التحكم | Instructor overview (stats cards) |
| `/admin/courses` | دوراتي | List instructor's courses |
| `/admin/courses/new` | إضافة دورة | Create course (instructorId = self) |
| `/admin/courses/[id]` | تفاصيل الدورة | View course |
| `/admin/courses/[id]/edit` | تعديل الدورة | Edit course |
| `/admin/courses/[id]/curriculum` | إضافة محتوى الدورة | Manage curriculum |
| `/admin/courses/[id]/lectures` | إدارة المحاضرات | Manage lectures |
| `/admin/my-students` | طلابي | Students enrolled in instructor's courses |
| `/admin/my-sales` | مبيعاتي | Sales for instructor's courses |
| `/admin/exam-attempts` | امتحانات طلابي | Exam attempts (may be scoped) |
| `/admin/databank` | بنك البيانات | Browse/add resources |
| `/admin/attendance/register` | تسجيل حضور | Register attendance manually |
| `/admin/teacher/attendance` | سجل الحضور | Instructor's attendance records |
| `/admin/teacher/salary/settings` | إعدادات الأجر | View salary settings (read-only) |
| `/admin/teacher/salary/calculation` | حساب الأجر | Calculate salary for period |
| `/admin/teacher/salary/reports` | تقاريري المالية | Salary reports |
| `/admin/chat` | المحادثات | Chat with users |
| `/admin/profile` | الملف الشخصي | View own profile |

### 2.3 Pages NOT Available to Instructors
- `/admin/users`, `/admin/instructors`, `/admin/categories`, `/admin/countries`
- `/admin/courses/pending` (course approval)
- `/admin/exams/new`, `/admin/exams/[id]/edit`
- `/admin/live-sessions`, `/admin/payments`, `/admin/payments/coupons`
- `/admin/monthly-notifications-reports`, `/admin/notifications`
- `/admin/banners`, `/admin/certificates`
- `/admin/attendance` (QR scan — uses AppLayout; instructor can use register)
- `/admin/attendance/manage`
- `/admin/teachers/*` (admin manages all teachers)
- `/admin/students/*`, `/admin/treasury`, `/admin/financial-reports`
- `/admin/reports`, `/admin/settings`, `/admin/offline-videos`

---

## 3. Pages (Detailed Inventory)

### 3.1 Login (`/admin/login`)

**Purpose**: Authenticate. Instructors must have `role === 'instructor'`.

**Behavior**: Same as admin login. On success, `user.role` is checked. If not `admin`, `super_admin`, or `instructor`, show "غير مصرح لك بالدخول للوحة التحكم" and do not redirect.

---

### 3.2 Dashboard (`/admin/dashboard`)

**Purpose**: Overview of instructor's performance.

**Layout**: AdminLayout, InstructorOverviewCards (4 stat cards), Refresh button. No charts.

**Components**: AdminLayout, InstructorOverviewCards, Button (RefreshCw).

**Data & API**:
- `coursesApi.getAll({ limit: 100, instructorId: user.id })`
- `paymentsApi.getAll({ limit: 100 })`

**Stats Computed**:
1. **طلابي** (My Students): Sum of `studentsCount` from instructor's courses
2. **دوراتي** (My Courses): Count of published courses
3. **إجمالي الاشتراكات**: Same as طلابي
4. **إجمالي المبيعات**: Sum of completed payment amounts for instructor's courses (ريال)

**State**: userRole from localStorage, mounted, refreshing.

---

### 3.3 My Courses (`/admin/courses`)

**Purpose**: List instructor's courses. Filtered by `instructorId` when role is instructor.

**Layout**: AdminLayout, DataTable.

**Data & API**: `coursesApi.getAll({ page, limit, instructorId: userId, categoryId?, status? })`

**User Interactions**: Filter by status, category; search; add course; view, edit, curriculum; publish/archive, toggle featured.

**Instructor-specific**: `instructorId` is always current user's id. Instructor selector is hidden on course create/edit.

---

### 3.4 Add Course (`/admin/courses/new`)

**Purpose**: Create a new course. For instructor, `instructorId` is auto-set to current user.

**Form Fields**: Title, description, thumbnail, price, discount price, level, category, certificate template, status, is featured. Instructor field hidden for instructors.

**API**: `coursesApi.create`. Payload includes `instructorId: user.id` for instructors.

---

### 3.5 My Students (`/admin/my-students`)

**Purpose**: List students enrolled in instructor's courses.

**Layout**: AdminLayout, DataTable with search and pagination.

**Data & API**:
- `coursesApi.getAll({ limit: 100, instructorId: user.id })`
- `paymentsApi.getAll({ limit: 100 })`
- `usersApi.getAll({ page: 1, limit: 100, role: "student", search? })`

**Logic**: 
- Get instructor's course IDs from coursesData
- Get enrolled user IDs from payments (itemType=course, itemId in myCourseIds, status=completed)
- Filter students by enrolledStudentIds
- Apply search filter (name, email)
- Client-side pagination (10 per page)

**Columns**: Avatar+name+email, role+studentType, status (StatusBadge).

**User Interactions**: Search by name/email, pagination.

---

### 3.6 My Sales (`/admin/my-sales`)

**Purpose**: List payments for instructor's courses.

**Layout**: AdminLayout, Summary Card (total sales), DataTable.

**Data & API**: `paymentsApi.getAll({ page, limit, instructorId: user.id })`

**Summary Card**: إجمالي المبيعات — sum of completed payment amounts (ريال).

**Columns**: Student (userName, userEmail), Course (itemName), Amount (ريال), Status (completed/pending/failed), Date.

**User Interactions**: Search, pagination.

**Empty State**: icon "payments", title "لا توجد مبيعات", description "لم يتم العثور على مبيعات لدوراتك".

---

### 3.7 Exam Attempts (`/admin/exam-attempts`)

**Purpose**: View exam attempts. Backend may scope by instructor's courses.

**Layout**: AdminLayout, DataTable.

**Data & API**: `examAttemptsApi.getAll({ page, limit, userId?, examId?, courseId?, isPassed?, search? })`

**Columns**: Student (avatar, name, email), Exam (title, course), Result (passed/failed, percentage, score), Submitted at, Actions (view user details).

**User Interactions**: Filter by user, exam, course, passed; search; pagination.

---

### 3.8 Databank (`/admin/databank`)

**Purpose**: Browse folders, resources (PDF, video, document); import from curriculum, export to curriculum.

**Instructor Access**: Full access. When importing/exporting, instructor sees only their courses.

**API**: `databankApi.getTopicsTree`, `databankResourcesApi`, `coursesApi.getAll({ instructorId })` for import/export.

---

### 3.9 Attendance Register (`/admin/attendance/register`)

**Purpose**: Manually register student attendance with payment.

**Layout**: AdminLayout, Card, form.

**Form Fields**:
- Course (Select) — instructor sees only own courses
- Teacher — auto-filled from course's instructor (read-only for instructor)
- Student (Select)
- Session type: offline | online
- Session date, time
- Price, Payment status (paid/partial/unpaid)
- Paid amount, Treasury, Payment method (when paid)

**API**: `coursesApi.getAll({ instructorId })`, `treasuryApi.getAll`, `attendanceExtendedApi.registerManually`.

**Instructor-specific**: When instructor selects course, teacherId is set from course.instructorId. Instructor only fetches own courses.

---

### 3.10 Teacher Attendance (`/admin/teacher/attendance`)

**Purpose**: View instructor's own attendance records.

**Layout**: AdminLayout, Card, DataTable, Select (filter by course), Button (link to register).

**Data & API**: `attendanceExtendedApi.getAll({ page: 1, limit: 100 })` — backend scopes by current instructor.

**Columns**: Student, Course, Type (offline/online), Date & Time, Price, Payment status (مدفوع/جزئي/غير مدفوع).

**User Interactions**: Filter by course, link to "تسجيل حضور".

---

### 3.11 Salary Settings (`/admin/teacher/salary/settings`)

**Purpose**: View (read-only) salary calculation settings. Set by admin.

**Layout**: AdminLayout, Card (max-w-3xl, centered).

**Data & API**: `teacherSalaryApi.getMySettings()` → `GET /admin/teachers/me/salary-settings`

**Response Shape**:
- `workType`: "offline" | "online" | "both"
- `calculationMethod`: "fixed_per_session" | "percentage" | "fixed_plus_percentage"
- `fixedAmount` (when fixed_per_session)
- `percentage` (when percentage)
- `fixedBaseAmount`, `percentageOnTop` (when fixed_plus_percentage)

**Display**:
- Work type: أوفلاين فقط / أونلاين فقط / أوفلاين + أونلاين
- Method: أجر ثابت بالحصة / نسبة من المبيعات / أجر ثابت + نسبة
- Info box: "يتم احتساب مستحقاتك تلقائياً... تعديل هذه القيم متاح من خلال مسؤول النظام فقط."

**States**: Loading (Loader2), No settings (message to contact admin), Error.

---

### 3.12 Salary Calculation (`/admin/teacher/salary/calculation`)

**Purpose**: Calculate instructor's salary for a selected month.

**Layout**: AdminLayout, Card (month picker), Summary Cards (4), Card (DataTable).

**Data & API**: `teacherSalaryApi.calculateMySalary({ startDate, endDate })` → `POST /admin/teachers/me/calculate-salary`

**Request**: `{ startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }` (first and last day of month).

**Response**: `{ sessionsCount, studentsCount, totalRevenue, teacherShare, centerProfit, calculationMethod?, period? }`

**Summary Cards**: عدد الحصص, عدد الطلاب, إجمالي المبيعات, مستحقاتي (teacherShare in ج.م).

**Table Columns**: Date, Sessions, Students, Revenue, Method, My Share (مستحقاتي), Center Profit.

**User Interactions**: Select month (Calendar popover), view calculated salary.

---

### 3.13 Salary Reports (`/admin/teacher/salary/reports`)

**Purpose**: View detailed salary reports for selected month.

**Layout**: AdminLayout, Error card (if error), Summary Cards (4), Card with DataTable and month picker.

**Data & API**: `teacherSalaryApi.getReports({ teacherId: "me", startDate, endDate, summary: true })`

**Summary Cards**: عدد الحصص, عدد الطلاب, إجمالي المبيعات, مستحقاتي.

**Table Columns**: Date, Sessions, Students, Revenue, My Share, Center Profit.

**User Interactions**: Select month (Calendar popover).

---

### 3.14 Chat (`/admin/chat`)

**Purpose**: Chat with students and other users.

**Layout**: AdminLayout, conversation list + message thread.

**API**: `chatApi.getConversations`, `getOrCreateConversation`, `getMessages`, `sendMessage`, `markMessageRead`.

**Role label**: "مدرس" for instructor.

---

### 3.15 Profile (`/admin/profile`)

**Purpose**: View instructor's own profile (read-only from localStorage).

**Layout**: AdminLayout, Cards.

**Data**: `localStorage.getItem("adminUser")` — no API call for profile data.

**Display**: Avatar, name, title, role (مدرب), email, phone, bio, status. Optional: titleEn, bioEn.

**States**: Loading, No user (error message).

---

## 4. Shared Components (Teacher Dashboard)

### 4.1 Layout
- **AdminLayout**: Same as admin. Auth check, Sidebar, Topbar, main.
- **Sidebar**: Uses `instructorNavItems` when `userRole === "instructor"`.
- **Topbar**: Same. Shows user name, role "مدرب", theme toggle, notifications, logout.

### 4.2 Dashboard
- **InstructorOverviewCards**: 4 StatCards (طلابي, دوراتي, الاشتراكات, المبيعات). Uses coursesApi, paymentsApi. No charts.

### 4.3 UI (Same as Admin)
- DataTable, Card, Button, Input, Label, Select, Badge, Avatar, Calendar, Popover
- StatusBadge, getUserStatusBadge
- CardSkeleton, FormSkeleton, ErrorState, EmptyState
- Dialog, Tabs, etc.

### 4.4 Instructor-Specific Behavior
- **Sidebar**: `instructorNavItems` — 10 items, no admin-only sections
- **Dashboard**: InstructorOverviewCards only (no DashboardCharts)
- **Courses**: instructorId filter applied
- **Profile**: In instructor nav; admin nav has Settings instead

---

## 5. Navigation & Information Architecture

### 5.1 Instructor Nav Items

| Label (Arabic) | Route | Children |
|----------------|-------|----------|
| لوحة التحكم | /admin/dashboard | — |
| دوراتي | /admin/courses | جميع دوراتي, إضافة دورة |
| طلابي | /admin/my-students | — |
| امتحانات طلابي | /admin/exam-attempts | — |
| بنك البيانات | /admin/databank | — |
| الحضور | /admin/teacher/attendance | تسجيل حضور, سجل الحضور |
| الأجر والعمولات | /admin/teacher/salary | إعدادات الأجر, حساب الأجر, تقاريري المالية |
| مبيعاتي | /admin/my-sales | — |
| المحادثات | /admin/chat | — |
| الملف الشخصي | /admin/profile | — |

### 5.2 Icons (Lucide)
- LayoutDashboard, BookOpen, Users, FileQuestion, Database, ClipboardCheck, Calculator, CreditCard, MessageCircle, User

### 5.3 Active State
- Same as admin: `bg-purple-500/10 text-purple-400` for active item
- Parent expanded when child route matches

### 5.4 Sidebar Label
- Logo subtitle: "لوحة المدرب" (vs "لوحة الإدارة" for admin)

---

## 6. Design System

Same as admin dashboard. See ADMIN_DASHBOARD_SPECIFICATION.md Section 6.

- Colors: oklch variables, light/dark
- Typography: Cairo
- Spacing: sidebar w-72, main p-6
- Purple accent for active states, StatCard icons

---

## 7. Auth & Access Control

### 7.1 Login
- Same as admin. Role must be `instructor` (or admin/super_admin).
- Store `adminUser` in localStorage, `accessToken` cookie.

### 7.2 Role Detection
- `localStorage.getItem("adminUser")` → `JSON.parse` → `user.role`
- Sidebar and dashboard components check `userRole === "instructor"`

### 7.3 API Scoping
- **Backend**: Instructor endpoints use `instructorMiddleware` to ensure `req.user.role === 'instructor'` and scope data to `req.user.id`
- **Frontend**: Pass `instructorId: user.id` or `teacherId: "me"` where applicable
- **Teacher Salary**: `GET /admin/teachers/me/salary-settings`, `POST /admin/teachers/me/calculate-salary`
- **Attendance**: `attendanceExtendedApi.getAll` — backend filters by current instructor

### 7.4 Route Protection
- AdminLayout checks token. No token → redirect to /admin/login
- Nav items control visibility. Instructor cannot navigate to admin-only routes (they are not in the sidebar)

---

## 8. Dependencies & Integrations

Same as admin. Key: useApi, useMutation, coursesApi, paymentsApi, usersApi, attendanceExtendedApi, teacherSalaryApi, examAttemptsApi, databankApi, chatApi, treasuryApi.

---

## 9. Rebuild Checklist

1. **Setup**  
   - Next.js 16, TypeScript, Tailwind v4, RTL, Cairo font

2. **Auth**  
   - Login at /admin/login, role check for instructor
   - Store adminUser, accessToken cookie

3. **Layout**  
   - AdminLayout with Sidebar + Topbar
   - Instructor nav items (10 items, no admin sections)
   - Sidebar label "لوحة المدرب"

4. **Dashboard**  
   - InstructorOverviewCards: fetch courses (instructorId), payments; compute stats (students, courses, subscriptions, revenue)

5. **Courses**  
   - List with instructorId filter
   - Create with instructorId = self
   - Edit, curriculum, lectures

6. **My Students**  
   - Fetch courses, payments, users; filter students by enrollment in instructor's courses; search, pagination

7. **My Sales**  
   - Fetch payments with instructorId; summary card; DataTable

8. **Exam Attempts**  
   - List with filters; backend may scope by instructor

9. **Databank**  
   - Full access; import/export scoped to instructor's courses

10. **Attendance**  
    - Register: form with course (instructor's only), student, session, payment  
    - Teacher attendance: list records (backend scoped)

11. **Salary**  
    - Settings: GET /admin/teachers/me/salary-settings (read-only)  
    - Calculation: POST /admin/teachers/me/calculate-salary with date range  
    - Reports: GET with teacherId "me", summary=true

12. **Chat**  
    - Conversations, messages, send

13. **Profile**  
    - Display adminUser from localStorage (read-only)

14. **Backend**  
    - Instructor middleware; scope attendance, salary, courses by instructorId  
    - Endpoints: /admin/teachers/me/salary-settings, /admin/teachers/me/calculate-salary  
    - attendanceExtendedApi.getAll scoped to current instructor

---

*End of Teacher Dashboard Specification.*
