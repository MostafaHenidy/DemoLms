"use client"

import React from "react"
import { cn } from "@/lib/utils"

type StatusVariant = "success" | "warning" | "error" | "info" | "default"

const variantStyles: Record<
  StatusVariant,
  string
> = {
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-700",
  error: "border-red-500/30 bg-red-500/10 text-red-700",
  info: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  default:
    "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
}

interface StatusBadgeProps {
  status: StatusVariant
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[status],
        className
      )}
    >
      {children}
    </span>
  )
}

export function getUserStatusBadge(status: string) {
  const map: Record<string, StatusVariant> = {
    active: "success",
    blocked: "error",
    pending: "warning",
  }
  return map[status] ?? "default"
}

export function getPaymentStatusBadge(status: string) {
  const map: Record<string, StatusVariant> = {
    completed: "success",
    pending: "warning",
    failed: "error",
    refunded: "info",
  }
  return map[status] ?? "default"
}

export function getCourseStatusBadge(status: string) {
  const map: Record<string, StatusVariant> = {
    published: "success",
    draft: "warning",
    archived: "default",
  }
  return map[status] ?? "default"
}
