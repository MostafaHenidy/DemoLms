"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

export interface FilterItem {
  key: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export interface PaginationState {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface EmptyStateConfig {
  icon?: "file" | "file-question" | "search" | "users" | "courses" | "calendar" | "payments" | "notifications"
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  emptyState?: EmptyStateConfig
  pagination?: PaginationState
  filters?: FilterItem[]
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  isLoading = false,
  error,
  onRetry,
  searchPlaceholder,
  onSearch,
  searchValue = "",
  emptyState,
  pagination,
  filters,
}: DataTableProps<T>) {
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={onRetry}
        className="min-h-[200px]"
      />
    )
  }

  return (
    <div className="space-y-4">
      {(searchPlaceholder || filters?.length) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchPlaceholder && onSearch && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="max-w-sm"
            />
          )}
          {filters?.map((f) => (
            <Select
              key={f.key}
              value={f.value}
              onValueChange={f.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                {f.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : data.length === 0 ? (
          emptyState ? (
            <EmptyState
              icon={emptyState.icon}
              title={emptyState.title}
              description={emptyState.description}
              action={emptyState.action}
              className="min-h-[200px]"
            />
          ) : (
            <div className="py-12 text-center text-muted-foreground text-sm">
              لا توجد بيانات
            </div>
          )
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn("text-right", col.className)}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={(row as { id?: number | string }).id ?? idx}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("text-right", col.className)}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
