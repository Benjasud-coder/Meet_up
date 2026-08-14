import { dealGame, dealNewRound, type LobbyMember } from "./deck"
import { addStats, emptyStats, scoreAll, overcomesChallenge } from "./scoring"
import { duelScore, statsTotal } from "./scoring"
import type { GameState, PlayerState, Stats, AttributeCard } from "./types"
import { DEFAULT_TOTAL_ROUNDS } from "./constants"

export type GameAction =
  | { type: "duel_choice"; playerId: string; attributeId: string }
  | { type: "global_choice"; playerId: string; challengeId: string; customName?: string }
  | { type: "draw"; playerId: string; attributeId: string }
  | { type: "bajo"; playerId: string }
  | { type: "steal"; playerId: string; targetPlayerId: string }
  | { type: "start_new_round"; playerId: string }
  | { type: "keep_stolen"; playerId: string; keep: boolean }

export interface ReduceResult {
  state: GameState
  feed: string[]
}

/** Creates a fresh game (deals cards) for the given lobby members. */
export function startGame(code: string, members: LobbyMember[]): GameState {
  const players = dealGame(members)
  // Initialize roundWins map
  const roundWins: Record<string, number> = {}
  for (const m of members) roundWins[m.id] = 0

  return {
    code,
    phase: "duel",
    players,
    activePlayerId: null,
    round: 0,
    globalChallenge: null,
    globalChallengeCards: [],
    duelWinnerId: null,
    bajoBy: null,
    results: null,
    winnerId: null,
    bajoSuccess: null,
    roundNumber: 1,
    stolenCard: null,

    // Match-level fields
    totalRounds: DEFAULT_TOTAL_ROUNDS,
    roundWins,
    matchRoundNumber: 1,
    overallWinnerId: null,
  }
}

function player(state: GameState, id: string): PlayerState | undefined {
  return state.players.find((p) => p.id === id)
}

function clone(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

function resolveDuel(state: GameState, feed: string[]) {
  // Compare each player's chosen attribute; winner = most dimensions won, tiebreak by total.
  const scored = state.players.map((p) => {
    const attr = p.tableAttributes.find((a) => a.id === p.duelChoice)
    return { id: p.id, name: p.name, stats: attr ? attr.stats : emptyStats() }
  })
  let best = scored[0]
  let bestWins = -1
  let bestTotal = -Infinity
  for (const s of scored) {
    let wins = 0
    for (const other of scored) {
      if (other.id === s.id) continue
      const { aWins } = duelScore(s.stats, other.stats)
      wins += aWins
    }
    const total = statsTotal(s.stats)
    if (wins > bestWins || (wins === bestWins && total > bestTotal)) {
      best = s
      bestWins = wins
      bestTotal = total
    }
  }
  state.duelWinnerId = best.id
  state.activePlayerId = best.id
  state.phase = "global_challenge"
  feed.push(`${best.name} ganó el Duelo de Atributos y jugará primero.`)
}

function resolveGlobalChallenge(state: GameState, feed: string[]) {
  let combined: Stats = emptyStats()
  const cards: { name: string; tipo: "Específico" | "Creativo" }[] = []
  for (const p of state.players) {
    const ch = p.tableChallenges.find((c) => c.id === p.globalChoice)
    if (ch) {
      combined = addStats(combined, ch.stats)
      // Use the player's custom name if they provided one for a creative challenge
      const displayName = (ch.tipo === "Creativo" && p.customChallengeName)
        ? p.customChallengeName
        : ch.nombre
      cards.push({ name: displayName, tipo: ch.tipo })
    }
  }
  state.globalChallenge = combined
  state.globalChallengeCards = cards
  state.phase = "playing"
  state.round = 1
  feed.push("¡El Desafío Global de la Partida ha sido revelado! Comienza el juego.")
}

function everyTableEmpty(state: GameState): boolean {
  return state.players.every((p) => p.tableAttributes.length === 0)
}

/** Compute the eligible winner (first in ordered results who overcomes the challenge) */
function computeWinnerFromResults(state: GameState, results: { playerId: string; name: string; perDimension: Stats; total: number }[] | null) {
  if (!results) return null
  const eligible = results.filter((r) => {
    const p = state.players.find((pl) => pl.id === r.playerId)
    return p ? overcomesChallenge(p, state.globalChallenge) : false
  })
  return eligible[0] ?? null
}

/** Handle end-of-round bookkeeping: increment roundWins (if a winner), check match finish,
 *  and prepare results.
 */
function finishRoundAndMaybeAdvance(state: GameState, feed: string[]) {
  // Determine winner from state.results (if any)
  const winnerResult = computeWinnerFromResults(state, state.results)
  const winnerId = winnerResult ? winnerResult.playerId : null

  if (winnerId) {
    state.roundWins[winnerId] = (state.roundWins[winnerId] ?? 0) + 1
    feed.push(`${winnerResult!.name} ganó la ronda ${state.matchRoundNumber}.`)
    // Preserve the per-round winner in state.winnerId so the UI and later actions know who won
    state.winnerId = winnerId
  } else {
    feed.push(`Ronda ${state.matchRoundNumber} finalizada sin ganador.`)
    state.winnerId = null
  }

  const requiredWins = Math.ceil(state.totalRounds / 2)
  const overallWinner = Object.entries(state.roundWins).find(([, w]) => w >= requiredWins)
  if (overallWinner) {
    // Finish match — keep phase as "results" so UI can show final results
    state.overallWinnerId = overallWinner[0]
    state.phase = "results"
    const winnerPlayer = state.players.find((p) => p.id === state.overallWinnerId)
    const wins = state.roundWins[state.overallWinnerId]
    feed.push(`${winnerPlayer ? winnerPlayer.name : state.overallWinnerId} ganó la partida (${wins} de ${state.totalRounds} rondas).`)
    return
  }
}

function resolveBajo(state: GameState, feed: string[]) {
  const results = scoreAll(state.players, state.globalChallenge ?? emptyStats())
  state.results = results

  // Filter results to find who actually overcame the challenge in all dimensions
  const eligibleResults = results.filter((r) => {
    const p = state.players.find((pl) => pl.id === r.playerId)
    return p ? overcomesChallenge(p, state.globalChallenge) : false
  })

  const winner = eligibleResults[0] // Highest score among those who overcame the challenge
  state.winnerId = winner ? winner.playerId : null

  const caller = state.bajoBy
  const callerPlayer = caller ? state.players.find((p) => p.id === caller) : null
  const callerOvercomes = callerPlayer ? overcomesChallenge(callerPlayer, state.globalChallenge) : false

  // Caller succeeds if they are the winner (highest eligible) and they overcame the challenge
  state.bajoSuccess = Boolean(
    caller &&
    winner &&
    caller === winner.playerId &&
    callerOvercomes
  )

  state.phase = "results"

  if (winner) {
    feed.push(`Resultados calculados. Ganador provisional: ${winner.name} (${winner.total} pts).`)

    // Check if there are losers who have cards in hand (excluding their duelChoice card)
    const targetsWithCards = state.players.filter(
      (p) => p.id !== winner.playerId && p.hand.filter((a) => a.id !== p.duelChoice).length > 0
    )

    if (targetsWithCards.length > 0) {
      state.phase = "steal"
      feed.push(`¡Fase de robo activada! ${winner.name} elegirá un atributo al azar de un perdedor.`)
      // Do not finish the round yet — wait for the steal action to complete or be skipped.
      return
    } else {
      // No steal possible -> finalize round immediately
      state.phase = "results"
      finishRoundAndMaybeAdvance(state, feed)
      return
    }
  } else {
    state.phase = "results"
    feed.push("Resultados calculados. ¡Nadie logró superar el Desafío Global en todas las áreas!")
    // Finalize round (no winner)
    finishRoundAndMaybeAdvance(state, feed)
    return
  }
}

export function applyAction(prev: GameState, action: GameAction): ReduceResult {
  const state = clone(prev)
  const feed: string[] = []

  switch (action.type) {
    case "duel_choice": {
      if (state.phase !== "duel") break
      const p = player(state, action.playerId)
      if (!p || p.duelChoice) break
      p.duelChoice = action.attributeId
      feed.push(`${p.name} eligió su atributo para el duelo.`)
      if (state.players.every((pl) => pl.duelChoice)) resolveDuel(state, feed)
      break
    }
    case "global_choice": {
      if (state.phase !== "global_challenge") break
      const p = player(state, action.playerId)
      if (!p || p.globalChoice) break
      p.globalChoice = action.challengeId
      // Store the custom name if provided
      if (action.customName?.trim()) {
        p.customChallengeName = action.customName.trim()
      }
      feed.push(`${p.name} seleccionó en secreto su Desafío.`)
      if (state.players.every((pl) => pl.globalChoice)) resolveGlobalChallenge(state, feed)
      break
    }
    case "draw": {
      if (state.phase !== "playing") break
      if (state.activePlayerId !== action.playerId) break
      const p = player(state, action.playerId)
      if (!p || p.drewThisRound) break
      const idx = p.tableAttributes.findIndex((a) => a.id === action.attributeId)
      if (idx === -1) break
      const [card] = p.tableAttributes.splice(idx, 1)
      p.hand.push(card)
      p.drewThisRound = true
      feed.push(`${p.name} tomó un Atributo de su mesa.`)
      // Advance turn to the next player that can still act.
      const order = state.players.map((pl) => pl.id)
      const curIdx = order.indexOf(action.playerId)
      for (let step = 1; step <= order.length; step++) {
        const next = state.players[(curIdx + step) % order.length]
        if (next) {
          state.activePlayerId = next.id
          next.drewThisRound = false // PERMITE QUE VUELVA A ROBAR EN SU NUEVO TURNO
          break
        }
      }
      if (everyTableEmpty(state)) {
        feed.push("Se agotaron los Atributos en mesa. Resolviendo la partida...")
        state.bajoBy = state.activePlayerId
        resolveBajo(state, feed)
      }
      break
    }
    case "bajo": {
      if (state.phase !== "playing") break
      const p = player(state, action.playerId)
      if (!p) break
      state.bajoBy = action.playerId
      feed.push(`¡${p.name} ha dicho BAJO!`)
      resolveBajo(state, feed)
      break
    }
    case "steal": {
      if (state.phase !== "steal") break
      if (action.playerId !== state.winnerId) break

      const target = player(state, action.targetPlayerId)
      if (!target) break

      // Filter out the duel choice from the target's hand so they don't lose that one
      const stealableCards = target.hand.filter((a) => a.id !== target.duelChoice)
      if (stealableCards.length === 0) {
        // Nothing to steal; finalize round
        const finalResultsNoSteal = scoreAll(state.players, state.globalChallenge ?? emptyStats())
        state.results = finalResultsNoSteal
        state.phase = "results"
        finishRoundAndMaybeAdvance(state, feed)
        break
      }

      const randomIdx = Math.floor(Math.random() * stealableCards.length)
      const chosenCard = stealableCards[randomIdx]

      // Remove chosenCard from target's hand
      target.hand = target.hand.filter((a) => a.id !== chosenCard.id)

      // Add it to the winner's hand
      const winnerPlayer = player(state, state.winnerId)
      if (winnerPlayer) {
        winnerPlayer.hand.push(chosenCard)
        feed.push(`¡El ganador ${winnerPlayer.name} robó al azar la carta "${chosenCard.nombre}" de la mano de ${target.name}!`)
      }

      // Almacenar la carta robada para la siguiente ronda
      state.stolenCard = chosenCard

      // Recalculate scores and winner, then finalize round
      const finalResults = scoreAll(state.players, state.globalChallenge ?? emptyStats())
      state.results = finalResults
      state.phase = "results"
      finishRoundAndMaybeAdvance(state, feed)
      break
    }
    case "start_new_round": {
      if (state.phase !== "results") break;
      if (state.overallWinnerId) break;

      // 1. Verificar si hay un ganador y perdedores con cartas para robar
      if (state.winnerId) {
        const winnerId = state.winnerId;
        const targetsWithCards = state.players.filter(
          (p) => p.id !== winnerId && p.hand.filter((a) => a.id !== p.duelChoice).length > 0
        );

        // Si hay cartas para robar y no se ha robado aún
        if (targetsWithCards.length > 0 && !state.stolenCard) {
          state.phase = "steal";
          const winnerName = state.players.find((p) => p.id === winnerId)?.name ?? "El ganador";
          feed.push(`¡Fase de robo activada! ${winnerName} debe elegir a un jugador para robarle una carta.`);
          break; // Salimos del case para mostrar la pantalla/modal de robo
        }
      }

      // 2. Si no hay robo posible o ya terminó, preparamos la nueva ronda
      const startingId = state.winnerId ?? null;
      state.roundNumber += 1;
      state.matchRoundNumber += 1;

      // Limpieza de estado de la ronda anterior
      state.activePlayerId = startingId;
      state.duelWinnerId = null;
      state.bajoBy = null;
      state.results = null;
      state.bajoSuccess = null;
      state.globalChallenge = null;
      state.globalChallengeCards = [];
      state.round = 0;

      if (state.stolenCard) {
        state.phase = "new_round_setup";
        const winnerName = state.players.find((p) => p.id === startingId)?.name ?? "El ganador";
        feed.push(`Comienza la ronda ${state.roundNumber}. ${winnerName} decide si conserva la carta robada.`);
      } else {
        state.players = dealNewRound(state.players, startingId, false, null);
        state.winnerId = null;
        state.phase = "duel";
        feed.push(`Comienza la ronda ${state.roundNumber}. Elijan su atributo para el Duelo.`);
      }
      break;
    } // 👈 Llave de cierre de case "start_new_round"

    // ----------------------------------------------------
    // ACCIÓN: Decidir si conserva la carta robada
    // ----------------------------------------------------
    case "keep_stolen": {
      if (state.phase !== "new_round_setup") break;
      if (action.playerId !== state.winnerId) break;

      const keep = action.keep;
      const stolen = state.stolenCard;
      const startingId = state.winnerId;

      state.players = dealNewRound(state.players, startingId, keep, stolen);
      state.stolenCard = null;
      state.winnerId = null;

      state.phase = "duel";
      state.activePlayerId = startingId ?? null;

      const startingPlayer = state.players.find((p) => p.id === startingId)?.name ?? "Jugador";
      if (keep && stolen) {
        feed.push(`${startingPlayer} decidió conservar la carta "${stolen.nombre}". ¡Comienza el Duelo de la nueva ronda!`);
      } else {
        feed.push(`${startingPlayer} decidió descartar la carta robada. ¡Comienza el Duelo de la nueva ronda!`);
      }
      break;
    }
  }
}