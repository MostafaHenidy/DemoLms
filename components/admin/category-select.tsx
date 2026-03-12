"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CategoryOption {
  id: number
  nameAr: string
  nameEn: string
  slug: string
  pathAr: string
}

interface CategorySelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CategorySelect({ value, onValueChange, placeholder, className }: CategorySelectProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Select value="__loading__" onValueChange={onValueChange} disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="جاري التحميل..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__loading__">—</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  return (
    <Select value={value || "none"} onValueChange={(v) => onValueChange(v === "none" ? "" : v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || "اختر التصنيف"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">— بدون تصنيف —</SelectItem>
        {categories.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.pathAr}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
