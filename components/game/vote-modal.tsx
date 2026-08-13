"use client"

import { Loader2, ThumbsDown, ThumbsUp, Vote } from "lucide-react"
import type { GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"

export function VoteModal({
  state,
  me,
  onVote,
}: {
  state: GameState
  me: PlayerState
  onVote: (vote: "accept" | "reject") => void
}) {
  const caller = state.players.find((p) => p.id === state.bajoBy)
  const isCaller = me.id === state.bajoBy
  const myVote = state.votes[me.id]
  const voters = state.players.filter((p) => p.id !== state.bajoBy)
  const voted = voters.filter((p) => state.votes[p.id]).length
  const creativeCards = state.globalChallengeCards.filter((c) => c.tipo === "Creativo")

  return (
    <Modal labelledBy="vote-title" className="max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Vote className="size-5" />
        </span>
        <div>
          <h2 id="vote-title" className="text-lg font-semibold">
            Votación de Desafío Creativo
          </h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{caller?.name}</span> dijo ¡BAJO! Debe
            resolver: {creativeCards.map((c) => c.nombre).join(", ")}.
          </p>
        </div>
      </div>

      {isCaller ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium">Cuenta tu historia por voz o chat</p>
            <p className="text-sm text-muted-foreground">
              Los demás están votando... {voted}/{voters.length}
            </p>
          </div>
        </div>
      ) : myVote ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Voto registrado ({myVote === "accept" ? "Aceptar" : "Rechazar"}). Esperando...{" "}
            {voted}/{voters.length}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onVote("accept")}
            className="flex flex-col items-center gap-2 rounded-xl border border-[var(--dim-social)]/50 bg-[var(--dim-social)]/10 py-6 font-semibold text-[var(--dim-social)] transition hover:bg-[var(--dim-social)]/20 active:translate-y-px"
          >
            <ThumbsUp className="size-6" />
            Aceptar
          </button>
          <button
            onClick={() => onVote("reject")}
            className="flex flex-col items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 py-6 font-semibold text-destructive transition hover:bg-destructive/20 active:translate-y-px"
          >
            <ThumbsDown className="size-6" />
            Rechazar
          </button>
        </div>
      )}
    </Modal>
  )
}
