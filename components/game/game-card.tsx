"use client"

import { DIMENSIONS, type AttributeCard, type AvatarCard, type ChallengeCard } from "@/lib/game/types"
import { DIMENSION_META } from "@/lib/game/constants"
import { StatChips } from "./stat-display"
import { cn } from "@/lib/utils"

type AnyCard = AvatarCard | AttributeCard | ChallengeCard

function dominantDimension(card: AnyCard) {
  let best = DIMENSIONS[0]
  let bestVal = -Infinity
  for (const d of DIMENSIONS) {
    const v = Math.abs(card.stats[d])
    if (v > bestVal) {
      bestVal = v
      best = d
    }
  }
  return best
}

export function GameCard({
  card,
  kind,
  selected,
  disabled,
  onClick,
  className,
  compact,
}: {
  card: AnyCard
  kind: "avatar" | "attribute" | "challenge"
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  compact?: boolean
}) {
  const accent = DIMENSION_META[dominantDimension(card)].color
  const tipo = kind === "challenge" ? (card as ChallengeCard).tipo : null
  const interactive = Boolean(onClick)

  const kindLabel = kind === "avatar" ? "Avatar" : kind === "attribute" ? "Atributo" : "Desafío"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !interactive}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left transition-all",
        compact ? "w-full p-2" : "w-full p-3",
        interactive && !disabled && "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg",
        selected ? "border-primary ring-2 ring-primary/60" : "border-border",
        disabled && !selected && "opacity-55",
        className,
      )}
      style={{ boxShadow: selected ? `0 0 0 1px ${accent}` : undefined }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accent }}
      />
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
            {kindLabel}
            {tipo ? ` · ${tipo}` : ""}
          </p>
          <p className={cn("truncate font-semibold text-card-foreground", compact ? "text-xs" : "text-sm")}>
            {card.nombre}
          </p>
        </div>
        {kind === "challenge" && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold text-destructive"
            style={{ backgroundColor: "color-mix(in oklch, var(--destructive) 18%, transparent)" }}
          >
            −
          </span>
        )}
      </div>
      <StatChips stats={card.stats} className="mt-2" />
    </button>
  )
}

export function CardBack({
  label,
  count,
  className,
}: {
  label: string
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/40 text-center",
        className,
      )}
    >
      <div className="grid grid-cols-2 gap-0.5 opacity-40">
        {DIMENSIONS.map((d) => (
          <span
            key={d}
            className="size-2.5 rounded-full"
            style={{ backgroundColor: DIMENSION_META[d].color }}
          />
        ))}
      </div>
      <p className="mt-2 px-1 text-[0.65rem] font-medium text-muted-foreground">{label}</p>
      {typeof count === "number" && (
        <p className="text-lg font-bold text-foreground tabular-nums">{count}</p>
      )}
    </div>
  )
}
