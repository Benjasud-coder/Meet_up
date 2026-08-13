"use client"

import { useState } from "react"
import { Sparkles, Users, ArrowRight } from "lucide-react"
import { DimensionLegend } from "./game/stat-display"
import { cn } from "@/lib/utils"

export interface RoomEntry {
  code: string
  name: string
  isHost: boolean
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
function makeCode() {
  let out = ""
  for (let i = 0; i < 5; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return out
}

export function HomeScreen({ onEnter }: { onEnter: (entry: RoomEntry) => void }) {
  const [mode, setMode] = useState<"create" | "join">("create")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError("Escribe tu nombre de jugador.")
    if (mode === "join") {
      const c = code.trim().toUpperCase()
      if (c.length < 4) return setError("Introduce un código de sala válido.")
      onEnter({ code: c, name: trimmed, isHost: false })
    } else {
      onEnter({ code: makeCode(), name: trimmed, isHost: true })
    }
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-input/60 px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--dim-espiritual) 22%, transparent), transparent), radial-gradient(50% 40% at 90% 100%, color-mix(in oklch, var(--dim-social) 18%, transparent), transparent)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-primary" />
            Juego de cartas multijugador en tiempo real
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight">Duelo de Dimensiones</h1>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            De 2 a 4 jugadores desde sus propios dispositivos. Compite en las dimensiones Espiritual,
            Intelectual, Física y Social.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-xl backdrop-blur">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted/60 p-1">
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setError("")
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition",
                  mode === m
                    ? "bg-card text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "create" ? <Sparkles className="size-4" /> : <Users className="size-4" />}
                {m === "create" ? "Crear sala" : "Unirse"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Nombre de jugador
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alex"
                maxLength={16}
                className={inputCls}
                autoComplete="off"
              />
            </div>

            {mode === "join" && (
              <div>
                <label htmlFor="code" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Código de sala
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABCDE"
                  maxLength={6}
                  className={cn(inputCls, "font-mono tracking-[0.3em] uppercase")}
                  autoComplete="off"
                />
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:translate-y-px"
            >
              {mode === "create" ? "Crear sala de juego" : "Entrar a la sala"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <div className="mt-5 flex justify-center">
          <DimensionLegend />
        </div>
      </div>
    </main>
  )
}
