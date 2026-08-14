import { describe, it, expect } from "vitest" // O de 'jest' si usas Jest
import { startGame, applyAction } from "./lib/game" // Ajusta la ruta a tu game.ts

describe("Prueba de Escalabilidad y Múltiples Partidas", () => {
    it("Debería poder crear y gestionar 200 partidas simultáneas sin interferencias", () => {
        const totalPartidas = 200
        const partidas: Record<string, any> = {}

        // 1. Crear 1,000 partidas en paralelo
        for (let i = 1; i <= totalPartidas; i++) {
            const code = `SALA_${i}`
            const members = [
                { id: `p1_${i}`, name: `Jugador 1 de Sala ${i}`, isHost: true },
                { id: `p2_${i}`, name: `Jugador 2 de Sala ${i}`, isHost: false },
            ]
            partidas[code] = startGame(code, members)
        }

        // Comprobar que todas se crearon
        expect(Object.keys(partidas).length).toBe(totalPartidas)

        // 2. Modificar SOLO la partida 'SALA_500' (Jugador 1 elige su carta de duelo)
        const salaObjetivo = "SALA_100"
        const estadoAntes = partidas[salaObjetivo]
        const primeraCartaId = estadoAntes.players[0].tableAttributes[0].id

        const { state: nuevoEstado } = applyAction(estadoAntes, {
            type: "duel_choice",
            playerId: "p1_100",
            attributeId: primeraCartaId,
        })

        partidas[salaObjetivo] = nuevoEstado

        // 3. Verificaciones de aislamiento:
        // A) La SALA_500 sí debió cambiar
        expect(partidas["SALA_500"].players[0].duelChoice).toBe(primeraCartaId)

        // B) La SALA_1 o la SALA_999 NO debieron verse afectadas en lo absoluto
        expect(partidas["SALA_1"].players[0].duelChoice).toBeNull()
        expect(partidas["SALA_999"].players[0].duelChoice).toBeNull()

        console.log(`✅ ¡Prueba exitosa! Se ejecutaron ${totalPartidas} partidas en simultáneo y están 100% aisladas.`)
    })
})