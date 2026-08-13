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
  // La mano EXCLUYE deliberatamente la carta usada en el duelo (duelChoice) solo si existe
  const filteredHand = player.hand.filter((a) =>
    !player.duelChoice || a.id !== player.duelChoice
  )
  const handSum = sumAttributes(filteredHand)
  const perDimension = emptyStats()
  for (const d of DIMENSIONS) {
    // globalChallenge values are positive, so subtracting reduces the score.
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

/** Returns the total stats (Avatar + Hand attributes) for a player per dimension. */
export function playerTotalStats(player: PlayerState): Stats {
  const filteredHand = player.hand.filter((a) =>
    !player.duelChoice || a.id !== player.duelChoice
  )
  const handSum = sumAttributes(filteredHand)
  return {
    espiritual: player.avatar.stats.espiritual + handSum.espiritual,
    intelectual: player.avatar.stats.intelectual + handSum.intelectual,
    fisica: player.avatar.stats.fisica + handSum.fisica,
    social: player.avatar.stats.social + handSum.social,
  }
}

/** Checks if a player's total stats in every dimension exceed the challenge magnitude. */
export function overcomesChallenge(player: PlayerState, globalChallenge: Stats | null): boolean {
  if (!globalChallenge) return true
  // Compute effective per-dimension AFTER applying the global challenge penalty
  const filteredHand = player.hand.filter((a) =>
    !player.duelChoice || a.id !== player.duelChoice
  )
  const handSum = sumAttributes(filteredHand)
  for (const d of DIMENSIONS) {
    const effective = player.avatar.stats[d] + handSum[d] - globalChallenge[d]
    // Require strictly positive result to consider the challenge overcome
    if (effective <= 0) {
      return false
    }
  }
  return true
}