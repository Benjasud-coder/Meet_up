import type { AttributeCard, AvatarCard, ChallengeCard, PlayerState, Stats } from "./types"
import { ATTRIBUTES_DEALT, CHALLENGES_DEALT } from "./constants"

const s = (espiritual: number, intelectual: number, fisica: number, social: number): Stats => ({
  espiritual,
  intelectual,
  fisica,
  social,
})

/** 6 balanced avatars — each distributes exactly +30 points. */
export const AVATARS: AvatarCard[] = [
  { id: "av1", nombre: "El Monje", stats: s(15, 8, 4, 3) },
  { id: "av2", nombre: "La Estratega", stats: s(4, 15, 5, 6) },
  { id: "av3", nombre: "La Atleta", stats: s(3, 5, 15, 7) },
  { id: "av4", nombre: "El Líder", stats: s(5, 6, 4, 15) },
  { id: "av5", nombre: "El Equilibrado", stats: s(8, 8, 7, 7) },
  { id: "av6", nombre: "La Errante", stats: s(9, 4, 9, 8) },
]

/** 40 varied attributes — each distributes +100 positive points. */
export const ATTRIBUTES: AttributeCard[] = [
  { id: "at1", nombre: "Meditación Profunda", stats: s(60, 20, 10, 10) },
  { id: "at2", nombre: "Fe Inquebrantable", stats: s(70, 10, 5, 15) },
  { id: "at3", nombre: "Serenidad", stats: s(50, 25, 10, 15) },
  { id: "at4", nombre: "Sabiduría Ancestral", stats: s(45, 40, 5, 10) },
  { id: "at5", nombre: "Mente Analítica", stats: s(10, 65, 10, 15) },
  { id: "at6", nombre: "Estudio Constante", stats: s(15, 60, 10, 15) },
  { id: "at7", nombre: "Ingenio", stats: s(10, 55, 15, 20) },
  { id: "at8", nombre: "Estrategia", stats: s(20, 50, 15, 15) },
  { id: "at9", nombre: "Fuerza Bruta", stats: s(5, 10, 70, 15) },
  { id: "at10", nombre: "Resistencia", stats: s(10, 15, 60, 15) },
  { id: "at11", nombre: "Velocidad", stats: s(10, 20, 55, 15) },
  { id: "at12", nombre: "Agilidad", stats: s(15, 15, 50, 20) },
  { id: "at13", nombre: "Carisma", stats: s(10, 15, 10, 65) },
  { id: "at14", nombre: "Empatía", stats: s(20, 15, 5, 60) },
  { id: "at15", nombre: "Liderazgo", stats: s(10, 25, 10, 55) },
  { id: "at16", nombre: "Oratoria", stats: s(10, 30, 5, 55) },
  { id: "at17", nombre: "Templanza", stats: s(35, 30, 20, 15) },
  { id: "at18", nombre: "Disciplina", stats: s(25, 30, 35, 10) },
  { id: "at19", nombre: "Coraje", stats: s(20, 15, 40, 25) },
  { id: "at20", nombre: "Versatilidad", stats: s(25, 25, 25, 25) },
  { id: "at21", nombre: "Compasión", stats: s(40, 20, 15, 25) },
  { id: "at22", nombre: "Paciencia", stats: s(55, 20, 10, 15) },
  { id: "at23", nombre: "Inteligencia Emocional", stats: s(25, 30, 15, 30) },
  { id: "at24", nombre: "Creatividad", stats: s(20, 45, 15, 20) },
  { id: "at25", nombre: "Pensamiento Crítico", stats: s(15, 55, 10, 20) },
  { id: "at26", nombre: "Resolución de Problemas", stats: s(10, 60, 15, 15) },
  { id: "at27", nombre: "Concentración", stats: s(20, 50, 15, 15) },
  { id: "at28", nombre: "Memoria Excepcional", stats: s(15, 65, 10, 10) },
  { id: "at29", nombre: "Intuición Aguda", stats: s(35, 30, 10, 25) },
  { id: "at30", nombre: "Adaptabilidad", stats: s(20, 25, 20, 35) },
  { id: "at31", nombre: "Fortaleza Mental", stats: s(40, 25, 20, 15) },
  { id: "at32", nombre: "Tenacidad", stats: s(25, 20, 35, 20) },
  { id: "at33", nombre: "Atletismo", stats: s(5, 15, 65, 15) },
  { id: "at34", nombre: "Equilibrio", stats: s(10, 20, 50, 20) },
  { id: "at35", nombre: "Precisión", stats: s(15, 40, 30, 15) },
  { id: "at36", nombre: "Movilidad", stats: s(10, 15, 60, 15) },
  { id: "at37", nombre: "Confianza", stats: s(20, 20, 15, 45) },
  { id: "at38", nombre: "Magnetismo Personal", stats: s(15, 15, 10, 60) },
  { id: "at39", nombre: "Influencia", stats: s(15, 20, 10, 55) },
  { id: "at40", nombre: "Camaradería", stats: s(25, 15, 10, 50) },
]

/** 24 challenges (12 specific, 12 creative) — each distributes 100 points of penalty. */
export const CHALLENGES: ChallengeCard[] = [
  { id: "ch1", nombre: "Crisis de Fe", tipo: "Específico", stats: s(60, 15, 10, 15) },
  { id: "ch2", nombre: "Duda Existencial", tipo: "Específico", stats: s(50, 25, 10, 15) },
  { id: "ch3", nombre: "Bloqueo Mental", tipo: "Específico", stats: s(15, 60, 10, 15) },
  { id: "ch4", nombre: "Confusión", tipo: "Específico", stats: s(15, 55, 15, 15) },
  { id: "ch5", nombre: "Agotamiento", tipo: "Específico", stats: s(10, 15, 60, 15) },
  { id: "ch6", nombre: "Aislamiento", tipo: "Específico", stats: s(15, 15, 10, 60) },
  { id: "ch7", nombre: "Autocompasión Excesiva", tipo: "Específico", stats: s(55, 20, 15, 10) },
  { id: "ch8", nombre: "Rigidez Mental", tipo: "Específico", stats: s(20, 55, 15, 10) },
  { id: "ch9", nombre: "Parálisis", tipo: "Específico", stats: s(15, 20, 55, 10) },
  { id: "ch10", nombre: "Inseguridad", tipo: "Específico", stats: s(20, 15, 15, 50) },
  { id: "ch11", nombre: "Burnout Espiritual", tipo: "Específico", stats: s(50, 20, 20, 10) },
  { id: "ch12", nombre: "Desconexión Social", tipo: "Específico", stats: s(15, 15, 15, 55) },
  { id: "ch13", nombre: "El Vacío Interior", tipo: "Creativo", stats: s(45, 25, 15, 15) },
  { id: "ch14", nombre: "La Torre de Marfil", tipo: "Creativo", stats: s(15, 50, 20, 15) },
  { id: "ch15", nombre: "La Tormenta", tipo: "Creativo", stats: s(20, 20, 45, 15) },
  { id: "ch16", nombre: "El Espejo Roto", tipo: "Creativo", stats: s(15, 20, 20, 45) },
  { id: "ch17", nombre: "El Laberinto", tipo: "Creativo", stats: s(25, 35, 25, 15) },
  { id: "ch18", nombre: "La Máscara", tipo: "Creativo", stats: s(20, 25, 15, 40) },
  { id: "ch19", nombre: "El Abismo", tipo: "Creativo", stats: s(40, 30, 15, 15) },
  { id: "ch20", nombre: "Las Cadenas", tipo: "Creativo", stats: s(20, 20, 45, 15) },
  { id: "ch21", nombre: "El Eco", tipo: "Creativo", stats: s(30, 40, 15, 15) },
  { id: "ch22", nombre: "La Niebla", tipo: "Creativo", stats: s(25, 25, 25, 25) },
  { id: "ch23", nombre: "El Silencio", tipo: "Creativo", stats: s(35, 20, 20, 25) },
  { id: "ch24", nombre: "La Sombra", tipo: "Creativo", stats: s(20, 30, 25, 25) },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface LobbyMember {
  id: string
  name: string
  isHost: boolean
}

/** Deals a full game from the mocked deck for the given lobby members. */
export function dealGame(members: LobbyMember[]): PlayerState[] {
  const avatars = shuffle(AVATARS)
  const attributes = shuffle(ATTRIBUTES)
  const challenges = shuffle(CHALLENGES)

  let attrIdx = 0
  let chIdx = 0

  return members.map((m, i) => {
    const tableAttributes = attributes.slice(attrIdx, attrIdx + ATTRIBUTES_DEALT)
    attrIdx += ATTRIBUTES_DEALT
    const tableChallenges = challenges.slice(chIdx, chIdx + CHALLENGES_DEALT)
    chIdx += CHALLENGES_DEALT
    return {
      id: m.id,
      name: m.name,
      isHost: m.isHost,
      avatar: avatars[i % avatars.length],
      tableAttributes,
      tableChallenges,
      hand: [],
      duelChoice: null,
      globalChoice: null,
      customChallengeName: null,
      drewThisRound: false,
    }
  })
}

export function dealNewRound(
  players: PlayerState[],
  winnerId: string | null,
  keepStolen: boolean,
  stolenCard: AttributeCard | null,
  keptChallenge: ChallengeCard | null
): PlayerState[] {
  const attributes = shuffle(ATTRIBUTES)
  const challenges = shuffle(CHALLENGES)

  let attrIdx = 0
  let chIdx = 0

  return players.map((p) => {
    const isWinner = p.id === winnerId
    const shouldKeep = isWinner && keepStolen && !!stolenCard
    const shouldKeepChallenge = isWinner && !!keptChallenge

    const countToDeal = shouldKeep ? 3 : ATTRIBUTES_DEALT //fix 5 cartas?

    // Todos reciben sus cartas de mesa estándar
    const tableAttributes = attributes.slice(attrIdx, attrIdx + countToDeal)
    attrIdx += countToDeal

    // Si el ganador conserva la carta robada, se agrega A LA MESA (tendrá 4 cartas)
    if (shouldKeep && stolenCard) {
      tableAttributes.push(stolenCard)
    }

    const countChallengesToDeal = shouldKeepChallenge ? 1 : CHALLENGES_DEALT
    const tableChallenges = challenges.slice(chIdx, chIdx + countChallengesToDeal)
    chIdx += countChallengesToDeal

    if (shouldKeepChallenge && keptChallenge) {
      tableChallenges.push(keptChallenge)
    }

    return {
      ...p,
      tableAttributes,
      tableChallenges,
      hand: [], // 👈 SIEMPRE empieza vacía la mano
      duelChoice: null,
      globalChoice: null,
      customChallengeName: null,
      drewThisRound: false,
    }
  })
}
