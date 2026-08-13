export type Dimension = "espiritual" | "intelectual" | "fisica" | "social"

export const DIMENSIONS: Dimension[] = ["espiritual", "intelectual", "fisica", "social"]

export type Stats = Record<Dimension, number>

export interface AvatarCard {
  id: string
  nombre: string
  stats: Stats
}

export interface AttributeCard {
  id: string
  nombre: string
  stats: Stats
}

export type ChallengeType = "Específico" | "Creativo"

export interface ChallengeCard {
  id: string
  nombre: string
  tipo: ChallengeType
  stats: Stats
}

export type GamePhase =
  | "lobby"
  | "duel"
  | "global_challenge"
  | "playing"
  | "voting"
  | "steal"
  | "results"

/** Full state for a single player. Held authoritatively by the host and broadcast to all. */
export interface PlayerState {
  id: string
  name: string
  isHost: boolean
  avatar: AvatarCard
  /** Attribute cards face-down on this player's table (not yet drawn). */
  tableAttributes: AttributeCard[]
  /** The 2 hidden challenge cards on this player's table. */
  tableChallenges: ChallengeCard[]
  /** Attribute cards moved into this player's private hand this game. */
  hand: AttributeCard[]
  /** Attribute chosen for the opening duel. */
  duelChoice: string | null
  /** Challenge chosen to contribute to the Global Challenge. */
  globalChoice: string | null
  /** Custom name provided by the player for a creative challenge. */
  customChallengeName: string | null
  /** Whether the player drew an attribute this round. */
  drewThisRound: boolean
}

export interface ScoreBreakdown {
  playerId: string
  name: string
  perDimension: Stats
  total: number
}

export interface GameState {
  code: string
  phase: GamePhase
  players: PlayerState[]
  activePlayerId: string | null
  round: number
  /** Combined negative stats of every player's chosen challenge. */
  globalChallenge: Stats | null
  /** Names of the challenge cards that formed the global challenge. */
  globalChallengeCards: { name: string; tipo: ChallengeType }[]
  duelWinnerId: string | null
  /** id of the player who called BAJO. */
  bajoBy: string | null
  /** Whether the active BAJO involves a creative challenge that needs a vote. */
  votingOpen: boolean
  votes: Record<string, "accept" | "reject">
  results: ScoreBreakdown[] | null
  winnerId: string | null
  bajoSuccess: boolean | null

  /** Match-level fields for best-of-N rounds */
  totalRounds: number
  roundWins: Record<string, number>
  /** 1-based number indicating current round within the match */
  matchRoundNumber: number
  /** Set when a player wins the overall match */
  overallWinnerId?: string | null
}
