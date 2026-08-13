"use client"

import { Loader2, Sparkles, Hand } from "lucide-react"
import type { GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"

export function StealModal({
  state,
  me,
  onSteal,
}: {
  state: GameState
  me: PlayerState
  onSteal: (targetPlayerId: string) => void
}) {
  const winnerPlayer = state.players.find((p) => p.id === state.winnerId)
  const isWinner = me.id === state.winnerId

  // Losers who have at least one stealable card (not their duelChoice card)
  const targetPlayers = state.players.filter(
    (p) => p.id !== state.winnerId && p.hand.filter((a) => a.id !== p.duelChoice).length > 0
  )

  return (
    <Modal labelledBy="steal-title" className="max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 id="steal-title" className="text-lg font-semibold">
            Etapa de Robo de Atributo
          </h2>
          <p className="text-sm text-muted-foreground">
            El ganador puede arrebatar una carta al azar de un perdedor.
          </p>
        </div>
      </div>

      {isWinner ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground mb-1">
            Felicidades {me.name}, selecciona a qué jugador le robarás un atributo al azar:
          </p>
          <div className="flex flex-col gap-2">
            {targetPlayers.map((p) => {
              const count = p.hand.filter((a) => a.id !== p.duelChoice).length
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-input/20 p-3 hover:bg-input/40 transition"
                >
                  <div>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.avatar.nombre} · {count} {count === 1 ? "carta" : "cartas"} robables
                    </p>
                  </div>
                  <button
                    onClick={() => onSteal(p.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition active:translate-y-px"
                  >
                    <Hand className="size-3.5" />
                    Robar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Esperando al ganador</p>
            <p className="text-xs text-muted-foreground px-4 mt-1">
              El ganador <span className="font-semibold text-foreground">{winnerPlayer?.name}</span> está decidiendo de quién tomar un atributo al azar.
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
