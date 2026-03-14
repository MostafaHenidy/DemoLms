"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { getAdminUser } from "@/lib/admin-auth"
import { getAdminPageTitle } from "@/lib/admin-route-titles"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPublicPage =
    pathname === "/admin/login" || pathname === "/admin/register"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isPublicPage) return

    const user = getAdminUser()
    if (!user) {
      router.push("/admin/login")
      return
    }

    // Verify token with server
    fetch("/api/admin/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push(res.status === 401 ? "/admin/login?session=expired" : "/admin/login")
        }
      })
      .catch(() => {
        router.push("/admin/login")
      })
  }, [mounted, isPublicPage, router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin h-8 w-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" dir="rtl">
      {/* Desktop sidebar - fixed on right in RTL */}
      <aside className="hidden lg:block fixed top-0 right-0 z-40 h-screen w-72 flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Main content - margin for fixed sidebar on lg */}
      <div className="flex-1 min-w-0 flex flex-col lg:ms-72">
        <AdminTopbar
          onMenuClick={() => setSidebarOpen(true)}
          title={getAdminPageTitle(pathname)}
        />
        <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-72 p-0 lg:hidden">
          <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
          <div className="h-full overflow-y-auto">
            <AdminSidebar mobile />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
