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

/** 20 varied attributes — each distributes +100 positive points. */
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
]

/** 12 challenges (6 specific, 6 creative) — each distributes 100 points of penalty. */
export const CHALLENGES: ChallengeCard[] = [
  { id: "ch1", nombre: "Crisis de Fe", tipo: "Específico", stats: s(60, 15, 10, 15) },
  { id: "ch2", nombre: "Duda Existencial", tipo: "Específico", stats: s(50, 25, 10, 15) },
  { id: "ch3", nombre: "Bloqueo Mental", tipo: "Específico", stats: s(15, 60, 10, 15) },
  { id: "ch4", nombre: "Confusión", tipo: "Específico", stats: s(15, 55, 15, 15) },
  { id: "ch5", nombre: "Agotamiento", tipo: "Específico", stats: s(10, 15, 60, 15) },
  { id: "ch6", nombre: "Aislamiento", tipo: "Específico", stats: s(15, 15, 10, 60) },
  { id: "ch7", nombre: "El Vacío Interior", tipo: "Creativo", stats: s(45, 25, 15, 15) },
  { id: "ch8", nombre: "La Torre de Marfil", tipo: "Creativo", stats: s(15, 50, 20, 15) },
  { id: "ch9", nombre: "La Tormenta", tipo: "Creativo", stats: s(20, 20, 45, 15) },
  { id: "ch10", nombre: "El Espejo Roto", tipo: "Creativo", stats: s(15, 20, 20, 45) },
  { id: "ch11", nombre: "El Laberinto", tipo: "Creativo", stats: s(25, 35, 25, 15) },
  { id: "ch12", nombre: "La Máscara", tipo: "Creativo", stats: s(20, 25, 15, 40) },
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
