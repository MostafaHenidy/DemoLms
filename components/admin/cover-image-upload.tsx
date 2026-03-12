"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CoverImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
}

export function CoverImageUpload({ value, onChange, disabled }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

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
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9] disabled:opacity-50"
          >
            <Upload className="h-10 w-10" />
            <span className="text-sm font-medium">
              {uploading ? "جاري الرفع..." : "اضغط لرفع صورة الغلاف"}
            </span>
            <span className="text-xs">JPEG, PNG, WebP, GIF — حتى 5 ميجابايت</span>
          </button>
        )}
      </div>
      {value && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "جاري الرفع..." : "تغيير الصورة"}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
