import { DIMENSIONS, type AttributeCard, type PlayerState, type ScoreBreakdown, type Stats } from "./types"

export function emptyStats(): Stats {
  return { espiritual: 0, intelectual: 0, fisica: 0, social: 0 }
}

export function addStats(a: Stats, b: Stats): Stats {
  return {
    espiritual: a.espiritual + b.espiritual,
    intelectual: a.intelectual + b.intelectual,
    fisica: a.fisica + b.fisica,
    social: a.social + b.social,
  }
}

export function sumAttributes(attrs: AttributeCard[]): Stats {
  return attrs.reduce((acc, c) => addStats(acc, c.stats), emptyStats())
}

export function statsTotal(stats: Stats): number {
  return DIMENSIONS.reduce((acc, d) => acc + stats[d], 0)
}

/**
 * Puntaje_d = Avatar_d + Suma_Atributos_Mano_d - DesafíoGlobal_d
 * Puntaje_Final = suma de las 4 dimensiones.
 */
export function scorePlayer(player: PlayerState, globalChallenge: Stats): ScoreBreakdown {
  const handSum = sumAttributes(player.hand)
  const perDimension = emptyStats()
  for (const d of DIMENSIONS) {
    // globalChallenge values are negative, so subtracting adds the penalty magnitude.
    perDimension[d] = player.avatar.stats[d] + handSum[d] - globalChallenge[d]
  }
  return {
    playerId: player.id,
    name: player.name,
    perDimension,
    total: statsTotal(perDimension),
  }
}

export function scoreAll(players: PlayerState[], globalChallenge: Stats): ScoreBreakdown[] {
  return players.map((p) => scorePlayer(p, globalChallenge)).sort((a, b) => b.total - a.total)
}

/** Count how many dimensions player A beats player B in (used for the opening duel). */
export function duelScore(a: Stats, b: Stats): { aWins: number; bWins: number } {
  let aWins = 0
  let bWins = 0
  for (const d of DIMENSIONS) {
    if (a[d] > b[d]) aWins++
    else if (b[d] > a[d]) bWins++
  }
  return { aWins, bWins }
}
