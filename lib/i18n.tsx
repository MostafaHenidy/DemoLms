"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type Locale = "ar" | "en"
export type Direction = "rtl" | "ltr"

interface I18nContextType {
  locale: Locale
  dir: Direction
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}

export function useDir() {
  const { dir } = useI18n()
  return dir
}

import { translations } from "./translations"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar")

  const dir: Direction = locale === "ar" ? "rtl" : "ltr"

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
    document.documentElement.style.fontFamily =
      locale === "ar"
        ? "'Cairo', sans-serif"
        : "'Inter', sans-serif"
  }, [locale, dir])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", newLocale)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null
    if (saved && (saved === "ar" || saved === "en")) {
      setLocaleState(saved)
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".")
      let value: any = translations[locale]
      for (const k of keys) {
        value = value?.[k]
      }
      return typeof value === "string" ? value : key
    },
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}
