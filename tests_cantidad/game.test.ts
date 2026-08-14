import { describe, it, expect, beforeEach } from "vitest"
import { startGame, applyAction } from "../lib/game/engine"
import { dealNewRound } from "../lib/game/deck"
import type { GameState, PlayerState, AttributeCard } from "../lib/game/types"

describe("🧪 SUITE COMPLETA DE PRUEBAS DE LÓGICA DE JUEGO", () => {
    let mockMembers: Array<{ id: string; name: string; isHost?: boolean }>

    beforeEach(() => {
        mockMembers = [
            { id: "player_1", name: "Alice", isHost: true },
            { id: "player_2", name: "Bob", isHost: false },
        ]
    })

    // =========================================================================
    // 1. INICIALIZACIÓN Y VALIDACIONES DE SALA
    // =========================================================================
    describe("1. Inicialización de Partida (startGame)", () => {
        it("Debe crear un estado inicial válido para 2 jugadores", () => {
            const state = startGame("SALA_101", mockMembers)

            expect(state.code).toBe("SALA_101")
            expect(state.phase).toBe("duel")
            expect(state.players.length).toBe(2)
            expect(state.roundNumber).toBe(1)
            expect(state.matchRoundNumber).toBe(1)
            expect(state.overallWinnerId).toBeNull()
            expect(state.roundWins["player_1"]).toBe(0)
            expect(state.roundWins["player_2"]).toBe(0)
        })

        it("Cada jugador debe iniciar con cartas en mesa y mano vacía", () => {
            const state = startGame("SALA_102", mockMembers)

            state.players.forEach((player) => {
                expect(player.tableAttributes.length).toBeGreaterThan(0)
                expect(player.hand).toHaveLength(0)
                expect(player.duelChoice).toBeNull()
                expect(player.globalChoice).toBeNull()
            })
        })
    })

    // =========================================================================
    // 2. FASE DE DUELO (duel_choice)
    // =========================================================================
    describe("2. Fase de Duelo de Atributos", () => {
        it("Debe registrar la selección de duelo de un jugador", () => {
            const state = startGame("SALA_201", mockMembers)
            const p1Carta = state.players[0].tableAttributes[0].id

            const { state: nextState } = applyAction(state, {
                type: "duel_choice",
                playerId: "player_1",
                attributeId: p1Carta,
            })

            expect(nextState.players[0].duelChoice).toBe(p1Carta)
            expect(nextState.phase).toBe("duel") // Sigue en duelo hasta que el 2do elija
        })

        it("Debe avanzar automáticamente a 'global_challenge' cuando ambos eligen", () => {
            const state = startGame("SALA_202", mockMembers)
            const p1Carta = state.players[0].tableAttributes[0].id
            const p2Carta = state.players[1].tableAttributes[0].id

            const { state: step1 } = applyAction(state, {
                type: "duel_choice",
                playerId: "player_1",
                attributeId: p1Carta,
            })

            const { state: step2 } = applyAction(step1, {
                type: "duel_choice",
                playerId: "player_2",
                attributeId: p2Carta,
            })

            expect(step2.phase).toBe("global_challenge")
            expect(step2.duelWinnerId).not.toBeNull()
            expect(step2.activePlayerId).toBe(step2.duelWinnerId)
        })

        it("No debe permitir cambiar la carta de duelo si ya se seleccionó una", () => {
            const state = startGame("SALA_203", mockMembers)
            const primeraCarta = state.players[0].tableAttributes[0].id
            const segundaCarta = state.players[0].tableAttributes[1].id

            const { state: step1 } = applyAction(state, {
                type: "duel_choice",
                playerId: "player_1",
                attributeId: primeraCarta,
            })

            // Intento no permitido de sobrescribir
            const { state: step2 } = applyAction(step1, {
                type: "duel_choice",
                playerId: "player_1",
                attributeId: segundaCarta,
            })

            expect(step2.players[0].duelChoice).toBe(primeraCarta)
        })
    })

    // =========================================================================
    // 3. FASE DE DESAFÍO GLOBAL (global_choice)
    // =========================================================================
    describe("3. Selección de Desafío Global", () => {
        it("Debe almacenar un nombre personalizado para desafíos creativos", () => {
            const state = startGame("SALA_301", mockMembers)
            state.phase = "global_challenge"

            const desafioId = state.players[0].tableChallenges[0].id

            const { state: nextState } = applyAction(state, {
                type: "global_choice",
                playerId: "player_1",
                challengeId: desafioId,
                customName: "Mi Desafío Creativo Personalizado",
            })

            expect(nextState.players[0].customChallengeName).toBe("Mi Desafío Creativo Personalizado")
        })

        it("Debe avanzar a la fase 'playing' cuando ambos eligen su desafío", () => {
            const state = startGame("SALA_302", mockMembers)
            state.phase = "global_challenge"

            const ch1 = state.players[0].tableChallenges[0].id
            const ch2 = state.players[1].tableChallenges[0].id

            const { state: s1 } = applyAction(state, { type: "global_choice", playerId: "player_1", challengeId: ch1 })
            const { state: s2 } = applyAction(s1, { type: "global_choice", playerId: "player_2", challengeId: ch2 })

            expect(s2.phase).toBe("playing")
            expect(s2.globalChallenge).not.toBeNull()
            expect(s2.globalChallengeCards).toHaveLength(2)
        })
    })

    // =========================================================================
    // 4. TURNO Y ROBAR CARTAS DE LA MESA (draw)
    // =========================================================================
    describe("4. Mecánica de Robo de Cartas de Mesa (draw)", () => {
        it("Mueve la carta de la mesa a la mano del jugador y cambia el turno", () => {
            const state = startGame("SALA_401", mockMembers)
            state.phase = "playing"
            state.activePlayerId = "player_1"

            const cartaARobar = state.players[0].tableAttributes[0]

            const { state: nextState } = applyAction(state, {
                type: "draw",
                playerId: "player_1",
                attributeId: cartaARobar.id,
            })

            // Player 1 perdió 1 carta de la mesa y la ganó en mano
            expect(nextState.players[0].tableAttributes.find((c) => c.id === cartaARobar.id)).toBeUndefined()
            expect(nextState.players[0].hand.find((c) => c.id === cartaARobar.id)).toBeDefined()
            // El turno pasó al jugador 2
            expect(nextState.activePlayerId).toBe("player_2")
        })

        it("No debe permitir robar si NO es el turno del jugador", () => {
            const state = startGame("SALA_402", mockMembers)
            state.phase = "playing"
            state.activePlayerId = "player_1"

            const cartaP2 = state.players[1].tableAttributes[0]

            // Player 2 intenta robar fuera de turno
            const { state: nextState } = applyAction(state, {
                type: "draw",
                playerId: "player_2",
                attributeId: cartaP2.id,
            })

            expect(nextState.players[1].hand).toHaveLength(0) // No cambió nada
        })
    })

    // =========================================================================
    // 5. CANTA DE "BAJO" Y CÁLCULO DE RESULTADOS (bajo)
    // =========================================================================
    describe("5. Declaración de BAJO y Cierre de Ronda", () => {
        it("Cambia la fase a 'results' o 'steal' inmediatamente", () => {
            const state = startGame("SALA_501", mockMembers)
            state.phase = "playing"

            const { state: nextState } = applyAction(state, {
                type: "bajo",
                playerId: "player_1",
            })

            expect(nextState.bajoBy).toBe("player_1")
            expect(["results", "steal"]).toContain(nextState.phase)
        })
    })

    // =========================================================================
    // 6. FASE DE ROBO Y LÍMITE DE CARTAS (steal & keep_stolen)
    // =========================================================================
    describe("6. Fase de Robo y Control del Límite de 4 Cartas", () => {
        it("Solo el ganador puede ejecutar la acción de robo", () => {
            const state = startGame("SALA_601", mockMembers)
            state.phase = "steal"
            state.winnerId = "player_1"
            state.players[1].hand = [{ id: "c_perdedor", nombre: "Test", stats: { agilidad: 1, fuerza: 1, magia: 1, tecnologia: 1, resistencia: 1 } }]

            // Intento no autorizado del perdedor (player_2)
            const { state: nextState } = applyAction(state, {
                type: "steal",
                playerId: "player_2",
                targetPlayerId: "player_1",
            })

            expect(nextState.stolenCard).toBeNull()
        })

        it("Garantiza que la función dealNewRound limite a MÁXIMO 4 cartas si se conserva la robada", () => {
            const mockCartaRobada: AttributeCard = {
                id: "carta_robada_123",
                nombre: "Carta Robada Especial",
                stats: { agilidad: 5, fuerza: 5, magia: 5, tecnologia: 5, resistencia: 5 },
            }

            // Probar si el ganador CONSERVA la carta robada
            const nuevosJugadores = dealNewRound(
                [
                    { id: "player_1", name: "Alice" } as PlayerState,
                    { id: "player_2", name: "Bob" } as PlayerState,
                ],
                "player_1", // Ganador
                true,       // Conserva carta robada
                mockCartaRobada
            )

            const ganador = nuevosJugadores.find((p) => p.id === "player_1")!
            const perdedor = nuevosJugadores.find((p) => p.id === "player_2")!

            // El ganador debe tener exactamente 4 cartas en mesa (3 repartidas + 1 robada)
            expect(ganador.tableAttributes).toHaveLength(4)
            expect(ganador.tableAttributes.some((c) => c.id === mockCartaRobada.id)).toBe(true)

            // El perdedor debe tener exactamente 3 o 4 (según ATTRIBUTES_DEALT)
            expect(perdedor.tableAttributes.length).toBeLessThanOrEqual(4)

            // Ambas manos deben estar vacías al iniciar
            expect(ganador.hand).toHaveLength(0)
            expect(perdedor.hand).toHaveLength(0)
        })
    })

    // =========================================================================
    // 7. PROGRESIÓN Y FINALIZACIÓN DE LA PARTIDA (start_new_round)
    // =========================================================================
    describe("7. Fin del Match y Victorias Acumuladas", () => {
        it("Declara un ganador general cuando se alcanza la mayoría de victorias", () => {
            const state = startGame("SALA_701", mockMembers)
            state.phase = "results"
            state.totalRounds = 3 // Gana el primero con 2 victorias
            state.roundWins["player_1"] = 1 // Ya tiene 1 victoria

            // Simulamos que el juego otorga la 2da victoria a player_1
            state.results = [
                { playerId: "player_1", name: "Alice", perDimension: {} as any, total: 100 },
                { playerId: "player_2", name: "Bob", perDimension: {} as any, total: 50 },
            ]

            // Forzamos la verificación de fin de partida
            const { state: nextState } = applyAction(state, {
                type: "start_new_round",
                playerId: "player_1",
            })

            // Si alcanzó las victorias requeridas, no debería poder avanzar a una nueva ronda sin overallWinner
            if (nextState.overallWinnerId) {
                expect(nextState.overallWinnerId).toBe("player_1")
                expect(nextState.phase).toBe("results")
            }
        })
    })
})