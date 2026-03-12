"use client"

import React from "react"
import {
  FileQuestion,
  Search,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  FileText,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  file: FileQuestion,
  "file-question": FileQuestion,
  search: Search,
  users: Users,
  courses: BookOpen,
  calendar: Calendar,
  payments: CreditCard,
  notifications: Bell,
  default: FileQuestion,
}

interface EmptyStateProps {
  icon?: keyof typeof iconMap | "file" | "file-question" | "search" | "users" | "courses" | "calendar" | "payments" | "notifications"
  title: string
  description: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  icon = "file-question",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon] ?? iconMap.default

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
