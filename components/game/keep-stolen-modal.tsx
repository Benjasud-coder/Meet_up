"use client"

import { Loader2, Sparkles, Check, X } from "lucide-react"
import type { GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"
import { GameCard } from "./game-card"

export function KeepStolenModal({
  state,
  me,
  onKeepChoice,
}: {
  state: GameState
  me: PlayerState
  onKeepChoice: (keep: boolean) => void
}) {
  const winnerPlayer = state.players.find((p) => p.id === state.winnerId)
  const isWinner = me.id === state.winnerId
  const stolenCard = state.stolenCard

  return (
    <Modal labelledBy="keep-stolen-title" className="max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 id="keep-stolen-title" className="text-lg font-semibold">
            Decisión sobre Carta Robada
          </h2>
          <p className="text-sm text-muted-foreground">
            El ganador puede elegir si conservar el atributo robado para esta nueva ronda.
          </p>
        </div>
      </div>

      {isWinner && stolenCard ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">
            Hola {me.name}, ¿quieres comenzar esta ronda con la carta robada en tu mano?
          </p>
          
          <div className="flex justify-center my-2">
            <div className="w-64">
              <GameCard card={stolenCard} kind="attribute" compact />
            </div>
          </div>

          <div className="rounded-xl bg-input/20 border border-border p-3 text-[0.7rem] text-muted-foreground leading-normal">
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold text-foreground">Conservar (Sí):</span> Inicias con ella en tu mano privada y recibes 3 cartas de atributo a la mesa.
              </li>
              <li>
                <span className="font-semibold text-foreground">Descartar (No):</span> Se descarta la carta robada e inicias con 4 cartas de atributo a la mesa y tu mano vacía.
              </li>
            </ul>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onKeepChoice(false)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-input/30 px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-input/60 transition active:translate-y-px"
            >
              <X className="size-4" />
              Descartar (4 en mesa)
            </button>
            <button
              onClick={() => onKeepChoice(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition active:translate-y-px"
            >
              <Check className="size-4" />
              Conservar (3 en mesa)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Esperando al ganador anterior</p>
            <p className="text-xs text-muted-foreground px-4 mt-1">
              El ganador <span className="font-semibold text-foreground">{winnerPlayer?.name}</span> está decidiendo si conserva la carta que robó.
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
