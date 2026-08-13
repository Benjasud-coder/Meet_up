import type { Dimension } from "./types"

export const DIMENSION_META: Record<
  Dimension,
  { label: string; short: string; color: string; text: string; bg: string }
> = {
  espiritual: {
    label: "Espiritual",
    short: "ESP",
    color: "var(--dim-espiritual)",
    text: "text-[var(--dim-espiritual)]",
    bg: "bg-[var(--dim-espiritual)]",
  },
  intelectual: {
    label: "Intelectual",
    short: "INT",
    color: "var(--dim-intelectual)",
    text: "text-[var(--dim-intelectual)]",
    bg: "bg-[var(--dim-intelectual)]",
  },
  fisica: {
    label: "Física",
    short: "FIS",
    color: "var(--dim-fisica)",
    text: "text-[var(--dim-fisica)]",
    bg: "bg-[var(--dim-fisica)]",
  },
  social: {
    label: "Social",
    short: "SOC",
    color: "var(--dim-social)",
    text: "text-[var(--dim-social)]",
    bg: "bg-[var(--dim-social)]",
  },
}

/** Number of attribute cards each player draws before a round is complete. */
export const ATTRIBUTES_DEALT = 4
export const CHALLENGES_DEALT = 2
export const DEFAULT_TOTAL_ROUNDS = 3
