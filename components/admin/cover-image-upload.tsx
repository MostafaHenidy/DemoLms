"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Upload, X, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CoverImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function CoverImageUpload({ value, onChange, disabled }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [databankOpen, setDatabankOpen] = useState(false)
  const [databankImages, setDatabankImages] = useState<{ url: string; name: string }[]>([])
  const [databankLoading, setDatabankLoading] = useState(false)

  const loadDatabankImages = async () => {
    setDatabankLoading(true)
    try {
      const res = await fetch("/api/admin/databank/images")
      const data = await res.json()
      setDatabankImages(data.images ?? [])
    } catch {
      setDatabankImages([])
    } finally {
      setDatabankLoading(false)
    }
  }

  useEffect(() => {
    if (databankOpen) loadDatabankImages()
  }, [databankOpen])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      onChange(data.url)
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : "فشل رفع الصورة")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
        {value ? (
          <>
            <Image
              src={value}
              alt="صورة الغلاف"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 400px"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 end-2 h-8 w-8"
                onClick={() => onChange(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
            <span className="text-sm font-medium text-[#64748B]">
              {uploading ? "جاري الرفع..." : "اختر مصدر الصورة"}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                من الجهاز
              </button>
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => setDatabankOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                من بنك البيانات
              </button>
            </div>
            <span className="text-xs text-[#94A3B8]">
              JPEG, PNG, WebP, GIF — حتى 5 ميجابايت
            </span>
          </div>
        )}
      </div>
      {value && !disabled && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "جاري الرفع..." : "رفع من الجهاز"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDatabankOpen(true)}
            disabled={uploading}
          >
            اختيار من بنك البيانات
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      <Dialog open={databankOpen} onOpenChange={setDatabankOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>اختيار من بنك البيانات</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {databankLoading ? (
              <p className="py-8 text-center text-[#64748B]">جاري التحميل...</p>
            ) : databankImages.length === 0 ? (
              <p className="py-8 text-center text-[#64748B]">
                لا توجد صور في بنك البيانات. ارفع صورة من الجهاز أولاً.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {databankImages.map((img) => (
                  <button
                    type="button"
                    key={img.url}
                    onClick={() => {
                      onChange(img.url)
                      setDatabankOpen(false)
                    }}
                    className="relative aspect-video overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <Image
                      src={img.url}
                      alt={img.name}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
