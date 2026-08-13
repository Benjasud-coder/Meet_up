"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { getRealtimeClient } from "@/lib/supabase/realtime-client"
import { applyAction, startGame, type GameAction } from "@/lib/game/engine"
import type { LobbyMember } from "@/lib/game/deck"
import type { GameState } from "@/lib/game/types"

export interface RoomMember extends LobbyMember {
  ready: boolean
  online_at: number
}

export interface FeedItem {
  id: string
  message: string
}

export type ConnectionStatus = "connecting" | "connected" | "error"

interface UseGameRoomArgs {
  code: string
  playerId: string
  name: string
  isHost: boolean
}

let feedCounter = 0

export function useGameRoom({ code, playerId, name, isHost }: UseGameRoomArgs) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [members, setMembers] = useState<RoomMember[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [ready, setReady] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const gameStateRef = useRef<GameState | null>(null)
  const membersRef = useRef<RoomMember[]>([])
  const readyRef = useRef(false)
  const joinedAt = useRef<number>(Date.now())

  const pushFeed = useCallback((message: string) => {
    feedCounter += 1
    const item = { id: `f${feedCounter}-${Date.now()}`, message }
    setFeed((prev) => [...prev.slice(-8), item])
  }, [])

  const broadcast = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send({ type: "broadcast", event, payload })
  }, [])

  // ---- Host-only: process an action and fan out the resulting state ----
  const processAction = useCallback(
    (action: GameAction) => {
      const cur = gameStateRef.current
      if (!cur) return
      const { state, feed: messages } = applyAction(cur, action)
      gameStateRef.current = state
      setGameState(state)
      broadcast("game_state", { state })
      messages.forEach((m) => {
        pushFeed(m)
        broadcast("feed", { message: m })
      })
    },
    [broadcast, pushFeed],
  )

  useEffect(() => {
    const supabase = getRealtimeClient()
    const channel = supabase.channel(`room:${code}`, {
      config: { presence: { key: playerId } },
    })
    channelRef.current = channel

    channel.on("presence", { event: "sync" }, () => {
      const raw = channel.presenceState<RoomMember>()
      const list: RoomMember[] = Object.values(raw)
        .map((metas) => metas[0])
        .filter(Boolean)
        .sort((a, b) => a.online_at - b.online_at)
      membersRef.current = list
      setMembers(list)
      // Host re-syncs a running game to anyone who (re)joins.
      if (isHost && gameStateRef.current) {
        broadcast("game_state", { state: gameStateRef.current })
      }
    })

    channel.on("presence", { event: "join" }, ({ newPresences }) => {
      newPresences.forEach((p) => {
        const m = p as unknown as RoomMember
        if (m.id !== playerId) pushFeed(`${m.name} se unió a la sala.`)
      })
    })

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      leftPresences.forEach((p) => {
        const m = p as unknown as RoomMember
        pushFeed(`${m.name} salió de la sala.`)
      })
    })

    // Everyone receives authoritative state from the host.
    channel.on("broadcast", { event: "game_state" }, ({ payload }) => {
      const state = (payload as { state: GameState | null }).state
      gameStateRef.current = state
      setGameState(state)
    })

    // Everyone appends feed messages.
    channel.on("broadcast", { event: "feed" }, ({ payload }) => {
      pushFeed((payload as { message: string }).message)
    })

    // Host receives player actions and applies them.
    channel.on("broadcast", { event: "action" }, ({ payload }) => {
      if (!isHost) return
      processAction((payload as { action: GameAction }).action)
    })

    // Non-host asks host to resend the current state.
    channel.on("broadcast", { event: "request_state" }, () => {
      if (isHost && gameStateRef.current) {
        broadcast("game_state", { state: gameStateRef.current })
      }
    })

    // Host resets the room back to the lobby for a new match.
    channel.on("broadcast", { event: "reset_ready" }, () => {
      readyRef.current = false
      setReady(false)
      channel.track({
        id: playerId,
        name,
        isHost,
        ready: false,
        online_at: joinedAt.current,
      })
    })

    channel.subscribe(async (channelStatus) => {
      if (channelStatus === "SUBSCRIBED") {
        setStatus("connected")
        await channel.track({
          id: playerId,
          name,
          isHost,
          ready: false,
          online_at: joinedAt.current,
        })
        if (!isHost) broadcast("request_state", {})
      } else if (channelStatus === "CHANNEL_ERROR" || channelStatus === "TIMED_OUT") {
        setStatus("error")
      }
    })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, playerId, name, isHost])

  const toggleReady = useCallback(() => {
    const next = !readyRef.current
    readyRef.current = next
    setReady(next)
    channelRef.current?.track({
      id: playerId,
      name,
      isHost,
      ready: next,
      online_at: joinedAt.current,
    })
  }, [playerId, name, isHost])

  const dispatch = useCallback(
    (action: GameAction) => {
      if (isHost) processAction(action)
      else broadcast("action", { action })
    },
    [isHost, processAction, broadcast],
  )

  const beginGame = useCallback(() => {
    if (!isHost) return
    const roster: LobbyMember[] = membersRef.current.map((m) => ({
      id: m.id,
      name: m.name,
      isHost: m.isHost,
    }))
    if (roster.length < 2 || roster.length > 4) return
    const state = startGame(code, roster)
    gameStateRef.current = state
    setGameState(state)
    broadcast("game_state", { state })
    const msg = "¡La partida ha comenzado! Repartiendo cartas..."
    pushFeed(msg)
    broadcast("feed", { message: msg })
  }, [isHost, code, broadcast, pushFeed])

  const playAgain = useCallback(() => {
    if (!isHost) return
    gameStateRef.current = null
    setGameState(null)
    broadcast("game_state", { state: null })
    broadcast("reset_ready", {})
    readyRef.current = false
    setReady(false)
    channelRef.current?.track({
      id: playerId,
      name,
      isHost,
      ready: false,
      online_at: joinedAt.current,
    })
    const msg = "Volviendo a la sala de espera para una nueva partida."
    pushFeed(msg)
    broadcast("feed", { message: msg })
  }, [isHost, broadcast, pushFeed, playerId, name])

  return {
    status,
    members,
    gameState,
    feed,
    ready,
    self: { id: playerId, name, isHost },
    toggleReady,
    beginGame,
    playAgain,
    dispatch,
  }
}
