import { DIMENSION_META } from "@/lib/game/constants"
import { DIMENSIONS, type Stats } from "@/lib/game/types"
import { cn } from "@/lib/utils"

export function StatChips({
  stats,
  size = "sm",
  className,
}: {
  stats: Stats
  size?: "sm" | "md"
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-1", className)}>
      {DIMENSIONS.map((d) => {
        const meta = DIMENSION_META[d]
        const value = stats[d]
        return (
          <div
            key={d}
            className={cn(
              "flex items-center justify-between rounded-md px-1.5 tabular-nums",
              size === "sm" ? "py-0.5 text-[0.65rem]" : "py-1 text-xs",
            )}
            style={{ backgroundColor: `color-mix(in oklch, ${meta.color} 18%, transparent)` }}
          >
            <span className="font-semibold" style={{ color: meta.color }}>
              {meta.short}
            </span>
            <span className="font-bold" style={{ color: meta.color }}>
              {value > 0 ? `+${value}` : value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function DimensionLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {DIMENSIONS.map((d) => {
        const meta = DIMENSION_META[d]
        return (
          <div key={d} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-xs text-muted-foreground">{meta.label}</span>
          </div>
        )
      })}
    </div>
  )
}
