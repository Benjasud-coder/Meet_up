"use client"

import { Loader2, Swords, Target, Pencil, Check } from "lucide-react"
import { useState } from "react"
import type { ChallengeCard, GameState, PlayerState } from "@/lib/game/types"
import { Modal } from "./modal"
import { GameCard } from "./game-card"

export function SelectionModal({
  state,
  me,
  onSelectDuel,
  onSelectGlobal,
}: {
  state: GameState
  me: PlayerState
  onSelectDuel: (attributeId: string) => void
  onSelectGlobal: (challengeId: string, customName?: string) => void
}) {
  const isDuel = state.phase === "duel"
  const chosen = isDuel ? me.duelChoice : me.globalChoice
  const doneCount = state.players.filter((p) => (isDuel ? p.duelChoice : p.globalChoice)).length
  const total = state.players.length

  // For creative challenge naming flow
  const [pendingChallenge, setPendingChallenge] = useState<ChallengeCard | null>(null)
  const [customName, setCustomName] = useState("")

  function handleChallengeClick(card: ChallengeCard) {
    if (card.tipo === "Creativo") {
      // Enter naming step
      setPendingChallenge(card)
      setCustomName("")
    } else {
      // Specific challenge — submit directly
      onSelectGlobal(card.id)
    }
  }

  function handleConfirmCreative() {
    if (!pendingChallenge) return
    onSelectGlobal(pendingChallenge.id, customName.trim() || undefined)
    setPendingChallenge(null)
  }

  return (
    <Modal labelledBy="selection-title" className="max-w-md">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          {isDuel ? <Swords className="size-5" /> : <Target className="size-5" />}
        </span>
        <div>
          <h2 id="selection-title" className="text-lg font-semibold">
            {isDuel ? "Duelo de Atributos" : "Crea el Desafío Global"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isDuel
              ? "Elige 1 Atributo. Se revelan a la vez y quien gane más dimensiones jugará primero."
              : "Elige en secreto 1 de tus 2 Desafíos. Se sumarán para formar el Desafío Global."}
          </p>
        </div>
      </div>

      {chosen ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-input/40 py-8 text-center">
          <Loader2 className="size-6 animate-spin text-primary" />
          <div>
            <p className="font-medium">Selección enviada</p>
            <p className="text-sm text-muted-foreground">
              Esperando a los demás jugadores... {doneCount}/{total}
            </p>
          </div>
        </div>
      ) : pendingChallenge ? (
        /* ── Creative Challenge: naming step ── */
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-primary mb-1">
              Desafío Creativo seleccionado
            </p>
            <p className="font-semibold text-sm text-card-foreground">{pendingChallenge.nombre}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Puedes darle un nombre propio a este desafío para personalizar la partida.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="challenge-name-input"
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              <Pencil className="size-3" />
              Nombre personalizado (opcional)
            </label>
            <input
              id="challenge-name-input"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmCreative()}
              maxLength={60}
              placeholder={`Ej. "La Gran Prueba de ${me.name}"`}
              className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <p className="text-[0.6rem] text-muted-foreground text-right">{customName.length}/60</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPendingChallenge(null)}
              className="flex-1 rounded-xl border border-border bg-input/30 px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-input/60 transition active:translate-y-px"
            >
              Volver
            </button>
            <button
              onClick={handleConfirmCreative}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition active:translate-y-px"
            >
              <Check className="size-4" />
              Confirmar desafío
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {isDuel
            ? me.tableAttributes.map((c) => (
                <GameCard key={c.id} card={c} kind="attribute" onClick={() => onSelectDuel(c.id)} />
              ))
            : me.tableChallenges.map((c) => (
                <GameCard
                  key={c.id}
                  card={c}
                  kind="challenge"
                  onClick={() => handleChallengeClick(c)}
                />
              ))}
        </div>
      )}
    </Modal>
  )
}
