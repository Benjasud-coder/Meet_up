"use client"

import { Crown, RotateCcw, Trophy } from "lucide-react"
import { DIMENSIONS, type GameState } from "@/lib/game/types"
import { DIMENSION_META } from "@/lib/game/constants"
import { Modal } from "./modal"
import { cn } from "@/lib/utils"
import { overcomesChallenge } from "@/lib/game/scoring"

export function ResultsModal({
  state,
  isHost,
  onPlayAgain,
}: {
  state: GameState
  isHost: boolean
  onPlayAgain: () => void
}) {
  const results = state.results ?? []
  const winner = results.find((r) => r.playerId === state.winnerId)
  const caller = state.players.find((p) => p.id === state.bajoBy)
  const maxAbs = Math.max(
    1,
    ...results.flatMap((r) => DIMENSIONS.map((d) => Math.abs(r.perDimension[d]))),
  )
  const requiredWins = Math.ceil(state.totalRounds / 2)
  const isMatchOver = state.overallWinnerId !== null && state.overallWinnerId !== undefined
  const matchWinner = isMatchOver ? state.players.find((p) => p.id === state.overallWinnerId) : null

  return (
    <Modal labelledBy="results-title" className="max-w-xl">
      <div className="mb-4 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Trophy className="size-6" />
        </span>
        <h2 id="results-title" className="mt-2 text-xl font-bold">
          {isMatchOver ? "¡Partida Terminada!" : "Resultados de la Ronda"}
        </h2>

        {/* Match progress */}
        <p className="mt-2 text-xs text-muted-foreground font-medium">
          Ronda {state.matchRoundNumber} de {state.totalRounds}
        </p>

        {/* Score board */}
        <div className="mt-2 flex justify-center gap-4 text-sm">
          {state.players.map((p) => (
            <div key={p.id} className="flex items-center gap-1">
              <span className="font-semibold">{p.name}:</span>
              <span
                className={cn(
                  "tabular-nums font-bold",
                  state.roundWins[p.id] >= requiredWins ? "text-emerald-500" : "text-muted-foreground",
                )}
              >
                {state.roundWins[p.id]}
              </span>
            </div>
          ))}
        </div>

        {/* Round winner or overall winner */}
        {isMatchOver && matchWinner ? (
          <p className="mt-2 text-base font-bold text-emerald-500">
            🎉 {matchWinner.name} ganó la partida con {state.roundWins[matchWinner.id]} de {state.totalRounds} rondas
          </p>
        ) : winner ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Ganador de la ronda: <span className="font-semibold text-foreground">{winner.name}</span> con{" "}
            {winner.total} puntos.
          </p>
        ) : (
          <p className="mt-1 text-sm text-destructive font-semibold">
            ¡Nadie superó el Desafío Global en las 4 dimensiones!
          </p>
        )}
        {caller && (
          <div className="mt-2 flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                state.bajoSuccess
                  ? "bg-[var(--dim-social)]/15 text-[var(--dim-social)]"
                  : "bg-destructive/15 text-destructive",
              )}
            >
              ¡BAJO! de {caller.name}: {state.bajoSuccess ? "exitoso" : "fallido"}
            </span>
            {!state.bajoSuccess && (
              <span className="text-[0.65rem] text-destructive font-semibold">
                {state.winnerId === null
                  ? "Nadie superó el Desafío Global."
                  : !overcomesChallenge(caller, state.globalChallenge)
                  ? "No superó el Desafío Global en las 4 dimensiones."
                  : "Otro jugador obtuvo un mayor puntaje superando el Desafío."}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
        {results.map((r, i) => {
          const playerObj = state.players.find((p) => p.id === r.playerId)
          const isWinner = state.winnerId === r.playerId
          const overcame = playerObj ? overcomesChallenge(playerObj, state.globalChallenge) : false

          return (
            <div
              key={r.playerId}
              className={cn(
                "rounded-xl border p-3",
                isWinner ? "border-primary/60 bg-primary/5" : "border-border bg-input/30",
                !overcame && "opacity-75"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                  {r.name}
                  {isWinner && <Crown className="size-4 text-primary" />}
                  {overcame ? (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500">
                      Superado
                    </span>
                  ) : (
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive">
                      Falló Desafío
                    </span>
                  )}
                </span>
                <span className="text-lg font-bold tabular-nums">{r.total}</span>
              </div>
              <div className="flex flex-col gap-1">
                {DIMENSIONS.map((d) => {
                  const v = r.perDimension[d]
                  const meta = DIMENSION_META[d]
                  return (
                    <div key={d} className="flex items-center gap-2 text-xs">
                      <span className="w-8 shrink-0 font-medium" style={{ color: meta.color }}>
                        {meta.short}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(Math.abs(v) / maxAbs) * 100}%`,
                            backgroundColor: meta.color,
                            marginLeft: v < 0 ? "auto" : undefined,
                            opacity: v < 0 ? 0.5 : 1,
                          }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-semibold tabular-nums" style={{ color: meta.color }}>
                        {v}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5">
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:translate-y-px"
          >
            <RotateCcw className="size-4" />
            {isMatchOver ? "Volver al lobby" : "Siguiente ronda"}
          </button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {isMatchOver
              ? "Esperando a que el anfitrión vuelva a la sala de espera."
              : "Esperando a que el anfitrión inicie la siguiente ronda."}
          </p>
        )}
      </div>
    </Modal>
  )
}
