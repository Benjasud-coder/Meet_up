"use client"

import { AlertTriangle } from "lucide-react"
import { useGameRoom } from "@/hooks/use-game-room"
import type { RoomEntry } from "./home-screen"
import { Lobby } from "./lobby"
import { GameBoard } from "./game/game-board"
import { SelectionModal } from "./game/selection-modal"
import { StealModal } from "./game/steal-modal"
import { ChooseChallengeModal } from "./game/choose-challenge-modal"
import { KeepStolenModal } from "./game/keep-stolen-modal"
import { ResultsModal } from "./game/results-modal"
import { EventFeed } from "./game/event-feed"

export function GameRoom({
  entry,
  playerId,
  onLeave,
}: {
  entry: RoomEntry
  playerId: string
  onLeave: () => void
}) {
  const room = useGameRoom({
    code: entry.code,
    playerId,
    name: entry.name,
    isHost: entry.isHost,
  })

  const { gameState, self } = room

  if (room.status === "error") {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <AlertTriangle className="mx-auto mb-3 size-8 text-destructive" />
          <h1 className="text-lg font-semibold">Error de conexión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No se pudo conectar al servicio en tiempo real. Verifica tu conexión e inténtalo de nuevo.
          </p>
          <button
            onClick={onLeave}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    )
  }

  // No game started yet -> lobby.
  if (!gameState) {
    return (
      <>
        <Lobby
          code={entry.code}
          members={room.members}
          self={self}
          ready={room.ready}
          connecting={room.status === "connecting"}
          onToggleReady={room.toggleReady}
          onStart={room.beginGame}
          onLeave={onLeave}
        />
        <EventFeed feed={room.feed} />
      </>
    )
  }

  const me = gameState.players.find((p) => p.id === playerId)

  // Joined after the match started — not part of this game.
  if (!me) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-lg font-semibold">Partida en curso</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta sala ya inició una partida. Espera a que termine para unirte a la siguiente.
          </p>
          <button
            onClick={onLeave}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      <GameBoard
        state={gameState}
        me={me}
        onDraw={(attributeId) => room.dispatch({ type: "draw", playerId, attributeId })}
        onBajo={() => room.dispatch({ type: "bajo", playerId })}
        onLeave={onLeave}
      />

      {(gameState.phase === "duel" || gameState.phase === "global_challenge") && (
        <SelectionModal
          state={gameState}
          me={me}
          onSelectDuel={(attributeId) => room.dispatch({ type: "duel_choice", playerId, attributeId })}
          onSelectGlobal={(challengeId, customName) =>
            room.dispatch({ type: "global_choice", playerId, challengeId, customName })
          }
        />
      )}

      {gameState.phase === "steal" && (
        <StealModal
          state={gameState}
          me={me}
          onSteal={(targetPlayerId, targetAttributeId) =>
            room.dispatch({ type: "steal", playerId, targetPlayerId, targetAttributeId })
          }
        />
      )}

      {gameState.phase === "choose_challenge" && (
        <ChooseChallengeModal
          state={gameState}
          me={me}
          onChoose={(challengeId) =>
            room.dispatch({ type: "choose_challenge", playerId, challengeId })
          }
        />
      )}

      {gameState.phase === "new_round_setup" && (
        <KeepStolenModal
          state={gameState}
          me={me}
          onKeepChoice={(keep) =>
            room.dispatch({ type: "keep_stolen", playerId, keep })
          }
        />
      )}

      {gameState.phase === "results" && (
        <ResultsModal
          state={gameState}
          isHost={self.isHost}
          onPlayAgain={(currentState, forceLobby) => room.playAgain(currentState, forceLobby)}
        />
      )}

      <EventFeed feed={room.feed} />
    </>
  )
}
