"use client"

import { Loader2, Sparkles, Hand, ArrowLeft } from "lucide-react"
import { useState } from "react"
import type { GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"

export function StealModal({
  state,
  me,
  onSteal,
}: {
  state: GameState
  me: PlayerState
  onSteal: (targetPlayerId: string, targetAttributeId: string) => void
}) {
  const winnerPlayer = state.players.find((p) => p.id === state.winnerId)
  const isWinner = me.id === state.winnerId

  // Step 1: pick a player. Step 2: pick a card from that player.
  const [selectedTarget, setSelectedTarget] = useState<PlayerState | null>(null)

  // Losers who have at least one stealable card (not their duelChoice card)
  const targetPlayers = state.players.filter(
    (p) => p.id !== state.winnerId && p.hand.filter((a) => a.id !== p.duelChoice).length > 0
  )

  if (!isWinner) {
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
              El ganador puede arrebatar una carta a un perdedor.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Esperando al ganador</p>
            <p className="text-xs text-muted-foreground px-4 mt-1">
              El ganador <span className="font-semibold text-foreground">{winnerPlayer?.name}</span> está decidiendo qué carta robar.
            </p>
          </div>
        </div>
      </Modal>
    )
  }

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
            {selectedTarget
              ? `Elige cuál carta robarle a ${selectedTarget.name}:`
              : "Selecciona a quién le robarás una carta:"}
          </p>
        </div>
      </div>

      {selectedTarget ? (
        /* Step 2: pick a card (name only, no stats) */
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setSelectedTarget(null)}
            className="inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-3.5" />
            Cambiar jugador
          </button>
          <div className="flex flex-col gap-2">
            {selectedTarget.hand
              .filter((a) => a.id !== selectedTarget.duelChoice)
              .map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => onSteal(selectedTarget.id, card.id)}
                  className="flex items-center justify-between rounded-xl border border-border bg-input/20 px-4 py-3 text-sm font-semibold hover:bg-input/50 hover:border-primary/50 transition active:translate-y-px text-left"
                >
                  <span className="text-muted-foreground tabular-nums mr-3">{idx + 1}.</span>
                  <span className="flex-1 text-foreground">Atributo desconocido</span>
                  <Hand className="size-4 text-primary ml-3 shrink-0" />
                </button>
              ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Los nombres están ocultos — escoge sin saber cuál es.
          </p>
        </div>
      ) : (
        /* Step 1: pick a player */
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
                  onClick={() => setSelectedTarget(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition active:translate-y-px"
                >
                  <Hand className="size-3.5" />
                  Elegir
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
