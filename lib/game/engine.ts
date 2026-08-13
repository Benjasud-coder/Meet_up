import { dealGame, type LobbyMember } from "./deck"
import { addStats, emptyStats, scoreAll, overcomesChallenge } from "./scoring"
import { duelScore, statsTotal } from "./scoring"
import type { GameState, PlayerState, Stats } from "./types"

export type GameAction =
  | { type: "duel_choice"; playerId: string; attributeId: string }
  | { type: "global_choice"; playerId: string; challengeId: string; customName?: string }
  | { type: "draw"; playerId: string; attributeId: string }
  | { type: "bajo"; playerId: string }
  | { type: "steal"; playerId: string; targetPlayerId: string }

export interface ReduceResult {
  state: GameState
  feed: string[]
}

/** Creates a fresh game (deals cards) for the given lobby members. */
export function startGame(code: string, members: LobbyMember[]): GameState {
  const players = dealGame(members)
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
    votingOpen: false,
    votes: {},
    results: null,
    winnerId: null,
    bajoSuccess: null,
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
  state.votingOpen = false

  if (winner) {
    feed.push(`Resultados calculados. Ganador provisional: ${winner.name} (${winner.total} pts).`)
    
    // Check if there are losers who have cards in hand (excluding their duelChoice card)
    const targetsWithCards = state.players.filter(
      (p) => p.id !== winner.playerId && p.hand.filter((a) => a.id !== p.duelChoice).length > 0
    )
    
    if (targetsWithCards.length > 0) {
      state.phase = "steal"
      feed.push(`¡Fase de robo activada! ${winner.name} elegirá un atributo al azar de un perdedor.`)
    } else {
      state.phase = "results"
    }
  } else {
    state.phase = "results"
    feed.push("Resultados calculados. ¡Nadie logró superar el Desafío Global en todas las áreas!")
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
          break
        }
      }
      // Round complete when everyone has drawn.
      if (state.players.every((pl) => pl.drewThisRound)) {
        state.players.forEach((pl) => (pl.drewThisRound = false))
        state.round += 1
        feed.push(`Ronda completa. El botón ¡BAJO! está disponible.`)
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
      // BAJO only allowed once at least one full round has completed.
      if (state.round < 2) break
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
      if (stealableCards.length === 0) break

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

      // Recalculate scores and winner
      const finalResults = scoreAll(state.players, state.globalChallenge ?? emptyStats())
      state.results = finalResults
      state.phase = "results"
      break
    }
  }

  return { state, feed }
}
