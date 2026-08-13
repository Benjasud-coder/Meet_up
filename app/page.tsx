"use client"

import { useState } from "react"
import { HomeScreen, type RoomEntry } from "@/components/home-screen"
import { GameRoom } from "@/components/game-room"

export default function Page() {
  const [entry, setEntry] = useState<RoomEntry | null>(null)
  // Stable identity for this browser session.
  const [playerId] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `p_${Math.random().toString(36).slice(2)}`,
  )

  if (!entry) {
    return <HomeScreen onEnter={setEntry} />
  }

  return <GameRoom entry={entry} playerId={playerId} onLeave={() => setEntry(null)} />
}
