"use client"

import { Loader2, Swords, Target } from "lucide-react"
import type { GameState, PlayerState } from "@/lib/game/types"
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
  onSelectGlobal: (challengeId: string) => void
}) {
  const isDuel = state.phase === "duel"
  const chosen = isDuel ? me.duelChoice : me.globalChoice
  const doneCount = state.players.filter((p) => (isDuel ? p.duelChoice : p.globalChoice)).length
  const total = state.players.length

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
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {isDuel
            ? me.tableAttributes.map((c) => (
                <GameCard key={c.id} card={c} kind="attribute" onClick={() => onSelectDuel(c.id)} />
              ))
            : me.tableChallenges.map((c) => (
                <GameCard key={c.id} card={c} kind="challenge" onClick={() => onSelectGlobal(c.id)} />
              ))}
        </div>
      )}
    </Modal>
  )
}
