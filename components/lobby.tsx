"use client"

import { useState } from "react"
import { Check, Copy, Crown, Loader2, LogOut, Play } from "lucide-react"
import type { RoomMember } from "@/hooks/use-game-room"
import { cn } from "@/lib/utils"

export function Lobby({
  code,
  members,
  self,
  ready,
  connecting,
  onToggleReady,
  onStart,
  onLeave,
}: {
  code: string
  members: RoomMember[]
  self: { id: string; isHost: boolean }
  ready: boolean
  connecting: boolean
  onToggleReady: () => void
  onStart: () => void
  onLeave: () => void
}) {
  const [copied, setCopied] = useState(false)

  const readyCount = members.filter((m) => m.ready).length
  const canStart =
    self.isHost && members.length >= 2 && members.length <= 2 && readyCount === members.length

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col p-4">
      <header className="flex items-center justify-between py-4">
        <button
          onClick={onLeave}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <LogOut className="size-4" />
          Salir
        </button>
        <h1 className="text-lg font-semibold">Sala de espera</h1>
        <div className="w-14" />
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Código de sala — compártelo con tus amigos
        </p>
        <button
          onClick={copyCode}
          className="group mt-2 flex w-full items-center justify-between rounded-xl border border-border bg-input/50 px-4 py-3 transition hover:border-primary/60"
        >
          <span className="font-mono text-3xl font-bold tracking-[0.35em] text-foreground">
            {code}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground">
            {copied ? <Check className="size-4 text-[var(--dim-social)]" /> : <Copy className="size-4" />}
            {copied ? "Copiado" : "Copiar"}
          </span>
        </button>
      </section>

      <section className="mt-4 flex-1 rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Jugadores conectados
            <span className="ml-2 text-muted-foreground">{members.length}/2</span>
          </h2>
          <span className="text-xs text-muted-foreground">{readyCount} listos</span>
        </div>

        {connecting && members.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Conectando a la sala...
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition",
                  m.ready ? "border-[var(--dim-social)]/50 bg-[var(--dim-social)]/10" : "border-border bg-input/30",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary"
                    aria-hidden
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">
                    {m.name}
                    {m.id === self.id && <span className="ml-1 text-xs text-muted-foreground">(tú)</span>}
                  </span>
                  {m.isHost && <Crown className="size-4 text-primary" aria-label="Anfitrión" />}
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                    m.ready
                      ? "bg-[var(--dim-social)]/20 text-[var(--dim-social)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.ready && <Check className="size-3" />}
                  {m.ready ? "Listo" : "Esperando"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="sticky bottom-0 mt-4 flex flex-col gap-2 bg-background/80 py-4 backdrop-blur">
        <button
          onClick={onToggleReady}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:translate-y-px",
            ready
              ? "bg-muted text-foreground hover:bg-muted/70"
              : "bg-[var(--dim-social)] text-white hover:opacity-90",
          )}
        >
          <Check className="size-4" />
          {ready ? "Cancelar listo" : "Estoy listo"}
        </button>

        {self.isHost && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="size-4" />
            Iniciar partida
          </button>
        )}
        {self.isHost && !canStart && (
          <p className="text-center text-xs text-muted-foreground">
            Se necesitan de 2 jugadores, todos marcados como listos.
          </p>
        )}
        {!self.isHost && (
          <p className="text-center text-xs text-muted-foreground">
            Esperando a que el anfitrión inicie la partida.
          </p>
        )}
      </div>
    </main>
  )
}
