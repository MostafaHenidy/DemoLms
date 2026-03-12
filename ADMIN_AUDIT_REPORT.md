# Admin Dashboard Audit Report

**Date:** March 12, 2025  
**Scope:** Full audit of admin dashboard (Phases 1–4)

---

## Phase 1 — Scan & Map

### All Admin Routes (70 pages)

| Route | File Path | In Sidebar | Notes |
|-------|-----------|------------|-------|
| `/admin` | `app/admin/page.tsx` | — | Redirects to dashboard |
| `/admin/login` | `app/admin/login/page.tsx` | — | Public auth page |
| `/admin/register` | `app/admin/register/page.tsx` | — | Public auth page |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | ✓ | Main dashboard |
| `/admin/users` | `app/admin/users/page.tsx` | ✓ | User list |
| `/admin/users/new` | `app/admin/users/new/page.tsx` | ✓ | Add user |
| `/admin/users/[id]/details` | `app/admin/users/[id]/details/page.tsx` | — | Linked from users list |
| `/admin/users/[id]/settings` | `app/admin/users/[id]/settings/page.tsx` | — | Linked from instructors |
| `/admin/instructors` | `app/admin/instructors/page.tsx` | ✓ | **Added to nav** |
| `/admin/categories` | `app/admin/categories/page.tsx` | ✓ | |
| `/admin/countries` | `app/admin/countries/page.tsx` | ✓ | |
| `/admin/courses` | `app/admin/courses/page.tsx` | ✓ | |
| `/admin/courses/new` | `app/admin/courses/new/page.tsx` | ✓ | |
| `/admin/courses/pending` | `app/admin/courses/pending/page.tsx` | ✓ | |
| `/admin/courses/[id]` | `app/admin/courses/[id]/page.tsx` | — | Linked from list |
| `/admin/courses/[id]/edit` | `app/admin/courses/[id]/edit/page.tsx` | — | Linked from course |
| `/admin/courses/[id]/curriculum` | `app/admin/courses/[id]/curriculum/page.tsx` | — | Linked from course |
| `/admin/courses/[id]/lectures` | `app/admin/courses/[id]/lectures/page.tsx` | — | Placeholder, not linked |
| `/admin/databank` | `app/admin/databank/page.tsx` | ✓ | |
| `/admin/databank/new` | `app/admin/databank/new/page.tsx` | ✓ | |
| `/admin/databank/[id]/edit` | `app/admin/databank/[id]/edit/page.tsx` | — | Linked from databank |
| `/admin/exams` | `app/admin/exams/page.tsx` | ✓ | |
| `/admin/exams/new` | `app/admin/exams/new/page.tsx` | ✓ | |
| `/admin/exams/[id]/edit` | `app/admin/exams/[id]/edit/page.tsx` | — | Linked from list |
| `/admin/exam-attempts` | `app/admin/exam-attempts/page.tsx` | ✓ | |
| `/admin/exam-submissions/[id]` | `app/admin/exam-submissions/[id]/page.tsx` | — | Linked from attempts |
| `/admin/homework` | `app/admin/homework/page.tsx` | ✓ | |
| `/admin/homework/new` | `app/admin/homework/new/page.tsx` | ✓ | |
| `/admin/homework/[id]/edit` | `app/admin/homework/[id]/edit/page.tsx` | — | Linked from list |
| `/admin/homework-submissions` | `app/admin/homework-submissions/page.tsx` | ✓ | |
| `/admin/homework-submissions/[id]` | `app/admin/homework-submissions/[id]/page.tsx` | — | Linked from list |
| `/admin/live-sessions` | `app/admin/live-sessions/page.tsx` | ✓ | |
| `/admin/live-sessions/new` | `app/admin/live-sessions/new/page.tsx` | ✓ | |
| `/admin/payments` | `app/admin/payments/page.tsx` | ✓ | |
| `/admin/payments/coupons` | `app/admin/payments/coupons/page.tsx` | ✓ | |
| `/admin/monthly-notifications-reports` | `app/admin/monthly-notifications-reports/page.tsx` | ✓ | |
| `/admin/notifications` | `app/admin/notifications/page.tsx` | ✓ | |
| `/admin/chat` | `app/admin/chat/page.tsx` | ✓ | |
| `/admin/banners` | `app/admin/banners/page.tsx` | ✓ | |
| `/admin/certificates` | `app/admin/certificates/page.tsx` | ✓ | |
| `/admin/certificates/templates/new` | `app/admin/certificates/templates/new/page.tsx` | — | Linked from certs |
| `/admin/attendance` | `app/admin/attendance/page.tsx` | ✓ | |
| `/admin/attendance/register` | `app/admin/attendance/register/page.tsx` | ✓ | |
| `/admin/attendance/manage` | `app/admin/attendance/manage/page.tsx` | ✓ | |
| `/admin/teachers/salary-settings` | `app/admin/teachers/salary-settings/page.tsx` | ✓ | Admin salary |
| `/admin/teachers/salary-calculation` | `app/admin/teachers/salary-calculation/page.tsx` | ✓ | |
| `/admin/teachers/reports` | `app/admin/teachers/reports/page.tsx` | ✓ | Placeholder |
| `/admin/teacher/attendance` | `app/admin/teacher/attendance/page.tsx` | ✓ | Instructor |
| `/admin/teacher/salary` | `app/admin/teacher/salary/page.tsx` | — | Redirect only |
| `/admin/teacher/salary/settings` | `app/admin/teacher/salary/settings/page.tsx` | ✓ | |
| `/admin/teacher/salary/calculation` | `app/admin/teacher/salary/calculation/page.tsx` | ✓ | |
| `/admin/teacher/salary/reports` | `app/admin/teacher/salary/reports/page.tsx` | ✓ | |
| `/admin/students/financial` | `app/admin/students/financial/page.tsx` | ✓ | |
| `/admin/students/debts` | `app/admin/students/debts/page.tsx` | ✓ | |
| `/admin/students/payments` | `app/admin/students/payments/page.tsx` | ✓ | |
| `/admin/treasury` | `app/admin/treasury/page.tsx` | ✓ | |
| `/admin/treasury/revenue` | `app/admin/treasury/revenue/page.tsx` | ✓ | |
| `/admin/treasury/expenses` | `app/admin/treasury/expenses/page.tsx` | ✓ | |
| `/admin/treasury/transactions` | `app/admin/treasury/transactions/page.tsx` | ✓ | |
| `/admin/financial-reports` | `app/admin/financial-reports/page.tsx` | ✓ | |
| `/admin/financial-reports/daily` | `app/admin/financial-reports/daily/page.tsx` | ✓ | |
| `/admin/financial-reports/monthly` | `app/admin/financial-reports/monthly/page.tsx` | ✓ | |
| `/admin/financial-reports/students` | `app/admin/financial-reports/students/page.tsx` | ✓ | |
| `/admin/financial-reports/teachers` | `app/admin/financial-reports/teachers/page.tsx` | ✓ | |
| `/admin/reports` | `app/admin/reports/page.tsx` | — | **Redirects to financial-reports** |
| `/admin/my-students` | `app/admin/my-students/page.tsx` | ✓ | Instructor only |
| `/admin/my-sales` | `app/admin/my-sales/page.tsx` | ✓ | Instructor only |
| `/admin/profile` | `app/admin/profile/page.tsx` | ✓ | |
| `/admin/settings` | `app/admin/settings/page.tsx` | ✓ | |
| `/admin/offline-videos` | `app/admin/offline-videos/page.tsx` | — | In route titles, not nav |

### Duplicates / Redundancy

- **teacher/salary** → Redirects to teacher/salary/settings (kept for backwards compat)
- **reports** → Empty placeholder; now redirects to financial-reports; nav link updated
- **teachers/reports** vs **financial-reports/teachers** → Both EmptyState; different nav sections; kept both

### Orphan / Unlinked Pages

- `courses/[id]/lectures` — Placeholder "قيد التطوير", not linked
- `offline-videos` — In route titles, not in sidebar

---

## Phase 2 & 3 — Fixes Applied

### ✅ Bugs Fixed

| Fix | Description |
|-----|-------------|
| Auth: register page | `/admin/register` was protected; unauthenticated users could not reach it. **Fixed:** Added `isPublicPage` to exclude both `/admin/login` and `/admin/register` from auth guard. |
| Nav: instructors missing | Instructors list page existed but was not in sidebar. **Fixed:** Added "المدرسين" → `/admin/instructors` to admin nav. |
| Route title: instructors | Added `/admin/instructors` to `admin-route-titles.ts`. |
| Redundant reports | `/admin/reports` was empty placeholder. **Fixed:** Page now redirects to `/admin/financial-reports`; nav link "التقارير العامة" updated to point to financial-reports. |

### No Changes (Verified OK)

- Dialog `aria-describedby={undefined}` already present on categories, countries, coupons
- DataTable, forms, and API error handling in place
- No TypeScript/linter errors in admin routes

---

## Phase 4 — Redundant Pages

### Pages Kept (with changes)

- **reports** — Kept as redirect to financial-reports for bookmarks
- **teacher/salary** — Kept as redirect for backwards compatibility

### Navigation Updates

- "التقارير العامة" now links to `/admin/financial-reports` instead of `/admin/reports`
- "المدرسين" added for `/admin/instructors`

---

## Summary

### ✅ Pages Kept

All 70 admin pages retained. Two redirect-only pages (reports, teacher/salary) kept for compatibility.

### 🐛 Bugs Fixed

1. **Auth:** Register page excluded from auth guard so new instructors can sign up
2. **Nav:** Instructors page added to sidebar
3. **Route titles:** Instructors route title added
4. **Reports:** Empty reports page now redirects to financial-reports; nav link updated

### ⚠️ Remaining / Recommendations

| Issue | Recommendation |
|-------|----------------|
| `courses/[id]/lectures` | Placeholder, not linked. Either implement or add link from course detail. |
| `offline-videos` | In route titles but not in nav. Add to sidebar under Settings or Media if needed. |
| `teachers/reports` & `financial-reports/teachers` | Both EmptyState. Implement real reports when ready. |
| Favicon 404 | Add `app/favicon.ico` or `app/icon.png` to remove 404. |
