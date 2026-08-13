"use client"

import { useEffect, useState } from "react"
import { Radio } from "lucide-react"
import type { FeedItem } from "@/hooks/use-game-room"

/** Floating real-time feed: the newest event pops as a toast, full log on hover/tap. */
export function EventFeed({ feed }: { feed: FeedItem[] }) {
  const [open, setOpen] = useState(false)
  const latest = feed[feed.length - 1]
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    if (!latest) return
    setFlash(latest.id)
    const t = setTimeout(() => setFlash(null), 3500)
    return () => clearTimeout(t)
  }, [latest])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex flex-col items-center px-3">
      <div className="pointer-events-auto w-full max-w-md">
        {flash && latest && !open && (
          <button
            onClick={() => setOpen(true)}
            className="flex w-full animate-in items-center gap-2 rounded-xl border border-border bg-card/95 px-3 py-2 text-left text-xs shadow-lg backdrop-blur fade-in slide-in-from-bottom-2"
          >
            <Radio className="size-3.5 shrink-0 text-primary" />
            <span className="truncate text-card-foreground">{latest.message}</span>
          </button>
        )}
        {open && (
          <div className="rounded-xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur">
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Radio className="size-3.5 text-primary" /> Actividad en vivo
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cerrar
              </button>
            </div>
            <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
              {feed.length === 0 && (
                <li className="px-1 py-2 text-xs text-muted-foreground">Sin actividad todavía.</li>
              )}
              {[...feed].reverse().map((f) => (
                <li key={f.id} className="rounded-md px-2 py-1.5 text-xs text-card-foreground odd:bg-muted/40">
                  {f.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
