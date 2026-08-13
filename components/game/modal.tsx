"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Modal({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode
  className?: string
  labelledBy?: string
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" aria-hidden />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95",
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}
