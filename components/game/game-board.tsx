"use client"

import { AlertTriangle, Crown, Hand, LogOut, Layers, Check, X } from "lucide-react"
import { DIMENSIONS, type GameState, type PlayerState } from "@/lib/game/types"
import { DIMENSION_META } from "@/lib/game/constants"
import { GameCard } from "./game-card"
import { cn } from "@/lib/utils"
import { sumAttributes, playerTotalStats } from "@/lib/game/scoring"

function GlobalChallengeHeader({ state }: { state: GameState }) {
  const gc = state.globalChallenge
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2">
      <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-destructive">
        Desafío Global de la Partida
      </p>
      {gc ? (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {DIMENSIONS.map((d) => (
            <span key={d} className="text-xs font-bold tabular-nums text-destructive">
              {DIMENSION_META[d].short} {gc[d]}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">Definiéndose...</p>
      )}
    </div>
  )
}

function OpponentSeat({ player, isActive }: { player: PlayerState; isActive: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-3 transition",
        isActive ? "border-primary shadow-[0_0_0_1px_var(--primary)]" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {player.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-sm font-semibold">
              {player.name}
              {player.isHost && <Crown className="size-3 text-primary" />}
            </p>
            <p className="text-[0.65rem] text-muted-foreground">{player.avatar.nombre}</p>
          </div>
        </div>
        {isActive && (
          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[0.6rem] font-bold text-primary-foreground">
            Su turno
          </span>
        )}
      </div>
      <GameCard card={player.avatar} kind="avatar" compact />
      <div className="flex items-center justify-between gap-2 text-[0.65rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Layers className="size-3" /> Mesa {player.tableAttributes.length}
        </span>
        <span className="inline-flex items-center gap-1">
          <AlertTriangle className="size-3" /> Desafíos {player.tableChallenges.length}
        </span>
        <span className="inline-flex items-center gap-1">
          <Hand className="size-3" /> Mano {player.hand.length}
        </span>
      </div>
    </div>
  )
}

function ChosenAttributesSummary({
  me,
  globalChallenge,
}: {
  me: PlayerState
  globalChallenge: Record<string, number> | null
}) {
  const handSum = sumAttributes(me.hand)
  const totals = playerTotalStats(me)

  return (
    <div className="rounded-xl border border-border bg-input/10 p-3">
      <h3 className="mb-2 text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
        Tus Atributos y Desafío
      </h3>
      <div className="flex flex-col gap-1.5">
        {DIMENSIONS.map((d) => {
          const meta = DIMENSION_META[d]
          const chosenVal = handSum[d]
          const totalVal = totals[d]
          const challengeVal = globalChallenge ? Math.abs(globalChallenge[d]) : 0
          const overcome = totalVal > challengeVal

          return (
            <div
              key={d}
              className="flex items-center justify-between gap-1 rounded-lg bg-card/50 p-2 text-[0.7rem]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${meta.color} 18%, transparent)`,
                    color: meta.color,
                  }}
                >
                  {meta.short}
                </span>
                <span className="truncate font-semibold text-muted-foreground">{meta.label}</span>
              </div>
              <div className="flex items-center gap-2.5 text-right shrink-0">
                <div>
                  <span className="text-[0.55rem] text-muted-foreground block leading-none">Mano</span>
                  <span className="font-bold text-foreground">+{chosenVal}</span>
                </div>
                <div>
                  <span className="text-[0.55rem] text-muted-foreground block leading-none">Total</span>
                  <span className="font-bold text-foreground">{totalVal}</span>
                </div>
                <div className="border-l border-border pl-2">
                  <span className="text-[0.55rem] text-muted-foreground block leading-none">Meta</span>
                  <span className="font-semibold text-muted-foreground">
                    {globalChallenge ? challengeVal : "—"}
                  </span>
                </div>
                <div className="flex size-4 items-center justify-center">
                  {globalChallenge ? (
                    overcome ? (
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="size-3.5 text-destructive shrink-0" />
                    )
                  ) : (
                    <span className="text-muted-foreground text-[0.6rem]">—</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function GameBoard({
  state,
  me,
  onDraw,
  onBajo,
  onLeave,
}: {
  state: GameState
  me: PlayerState
  onDraw: (attributeId: string) => void
  onBajo: () => void
  onLeave: () => void
}) {
  const opponents = state.players.filter((p) => p.id !== me.id)
  const myTurn = state.activePlayerId === me.id && state.phase === "playing"
  const activePlayer = state.players.find((p) => p.id === state.activePlayerId)
  const bajoAvailable = state.phase === "playing" && state.round >= 2
  const canDraw = myTurn && !me.drewThisRound && me.tableAttributes.length > 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-3 p-3 pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 -mx-3 flex flex-col gap-2 border-b border-border bg-background/90 px-3 py-2 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="size-3.5" />
          </button>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Sala</p>
            <p className="font-mono text-sm font-bold tracking-widest">{state.code}</p>
          </div>
          <div className="border-l border-border pl-3">
            <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Ronda</p>
            <p className="text-sm font-bold tabular-nums">{state.round}</p>
          </div>
          <div className="border-l border-border pl-3">
            <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Turno</p>
            <p className="flex items-center gap-1 text-sm font-bold">
              {activePlayer?.id === me.id ? "Tú" : (activePlayer?.name ?? "—")}
            </p>
          </div>
        </div>
        <div className="sm:w-72">
          <GlobalChallengeHeader state={state} />
        </div>
      </header>

      {/* Opponents */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Oponentes
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {opponents.map((p) => (
            <OpponentSeat key={p.id} player={p} isActive={state.activePlayerId === p.id} />
          ))}
        </div>
      </section>

      {/* Turn banner */}
      <div
        className={cn(
          "rounded-xl border px-4 py-2.5 text-sm font-medium transition",
          myTurn
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border bg-card text-muted-foreground",
        )}
      >
        {myTurn
          ? me.drewThisRound
            ? "Ya tomaste tu Atributo esta ronda. Espera a los demás."
            : "Es tu turno. Toca un Atributo de tu mesa para moverlo a tu Mano Privada."
          : `Esperando a ${activePlayer?.name ?? "otro jugador"}...`}
      </div>

      {/* Player zone */}
      <section className="rounded-2xl border border-border bg-card/60 p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-col gap-3 sm:w-48 sm:shrink-0">
            <div>
              <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Tu Avatar
              </p>
              <GameCard card={me.avatar} kind="avatar" />
            </div>
            <ChosenAttributesSummary me={me} globalChallenge={state.globalChallenge} />
          </div>

          <div className="flex-1">
            <p className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Tu mesa · Atributos ({me.tableAttributes.length})
            </p>
            {me.tableAttributes.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                Sin atributos en mesa.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {me.tableAttributes.map((c) => (
                  <GameCard
                    key={c.id}
                    card={c}
                    kind="attribute"
                    compact
                    disabled={!canDraw}
                    onClick={canDraw ? () => onDraw(c.id) : undefined}
                  />
                ))}
              </div>
            )}

            <p className="mb-1.5 mt-3 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Tus Desafíos ocultos ({me.tableChallenges.length}) — solo tú los ves
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {me.tableChallenges.map((c) => (
                <GameCard key={c.id} card={c} kind="challenge" compact />
              ))}
            </div>
          </div>
        </div>

        {/* Private hand */}
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
            <Hand className="size-3" /> Mano Privada ({me.hand.length})
          </p>
          {me.hand.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              Toma Atributos de tu mesa para sumarlos a tu puntaje.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {me.hand.map((c) => (
                <GameCard key={c.id} card={c} kind="attribute" compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BAJO action */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center px-3">
        <button
          onClick={onBajo}
          disabled={!bajoAvailable}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-8 py-3 text-base font-bold shadow-xl transition active:translate-y-px",
            bajoAvailable
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          ¡BAJO!
        </button>
      </div>
    </div>
  )
}
