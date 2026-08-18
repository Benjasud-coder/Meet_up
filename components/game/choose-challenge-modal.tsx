"use client"

import { Loader2, Sparkles } from "lucide-react"
import type { GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"
import { GameCard } from "./game-card"

export function ChooseChallengeModal({
  state,
  me,
  onChoose,
}: {
  state: GameState
  me: PlayerState
  onChoose: (challengeId: string | null) => void
}) {
  const winnerPlayer = state.players.find((p) => p.id === state.winnerId)
  const isWinner = me.id === state.winnerId
  const usedChallenges = state.usedChallenges ?? []

  return (
    <Modal labelledBy="choose-challenge-title" className="max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 id="choose-challenge-title" className="text-lg font-semibold">
            Conservar un Desafío
          </h2>
          <p className="text-sm text-muted-foreground">
            El ganador puede elegir un desafío que se usó en esta ronda para conservarlo en su mesa.
          </p>
        </div>
      </div>

      {isWinner ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground mb-1">
            Felicidades {me.name}, selecciona cuál desafío quieres conservar (se sumará a tus desafíos en mesa la próxima ronda):
          </p>
          <div className="grid grid-cols-1 gap-2">
            {usedChallenges.map((c) => (
              <GameCard
                key={c.id}
                card={c}
                kind="challenge"
                onClick={() => onChoose(c.id)}
              />
            ))}
          </div>
          <button
            onClick={() => onChoose(null)}
            className="mt-2 w-full rounded-xl border border-border bg-input/30 py-3 text-sm font-semibold text-muted-foreground hover:bg-input/60 hover:text-foreground transition active:translate-y-px"
          >
            No conservar ninguno
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Esperando al ganador</p>
            <p className="text-xs text-muted-foreground px-4 mt-1">
              El ganador <span className="font-semibold text-foreground">{winnerPlayer?.name}</span> está decidiendo si conserva algún desafío de esta ronda.
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}
