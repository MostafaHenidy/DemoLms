import React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { StoreProvider } from "@/lib/store"
import { ThemeProvider } from "@/components/theme-provider"
import { GlobalToast } from "@/components/ui/global-toast"
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav"

export const metadata: Metadata = {
  title: "أكاديمية أنمكا | منصة تعليمية متكاملة",
  description:
    "منصة تعليمية رائدة تقدّم أفضل الدورات من أمهر المدربين. تعلّم في أي وقت ومن أي مكان واحصل على شهادات معتمدة.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <I18nProvider>
            <StoreProvider>
              {children}
              <GlobalToast />
              <MobileBottomNav />
            </StoreProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
