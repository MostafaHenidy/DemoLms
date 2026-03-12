"use client"

import React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: { value: number; isPositive: boolean }
  className?: string
  loading?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  loading = false,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-border/50 bg-card min-w-0 overflow-hidden",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {loading ? "—" : value}
            </p>
            {trend !== undefined && !loading && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-xs font-medium",
                  trend.isPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#2563EB]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
