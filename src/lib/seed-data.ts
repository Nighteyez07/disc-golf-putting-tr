import { initDB } from "./storage"
import { BASE_ATTEMPTS } from "./types"

export async function seedHistoryData() {
  try {
    const db = await initDB()
    const transaction = db.transaction(["sessions"], "readwrite")
    const store = transaction.objectStore("sessions")

    const sampleSessions = [
      {
        sessionId: "seed-session-1",
        startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endTime: Date.now() - 7 * 24 * 60 * 60 * 1000 + 600000,
        finalScore: 27,
        penaltyMode: false,
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        sessionSummary: {
          finalScore: 27,
          positionScores: [3, 3, 3, 3, 3, 3, 3, 3, 3],
          successfulPositions: 9,
          penaltyPositions: [],
          duration: 10,
          timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
        positionScores: [3, 3, 3, 3, 3, 3, 3, 3, 3],
        positions: [
          { positionNumber: 1, baseAttemptsAllocated: BASE_ATTEMPTS[1], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[1], attemptsUsed: 3, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 2, baseAttemptsAllocated: BASE_ATTEMPTS[2], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[2], attemptsUsed: 4, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 3, baseAttemptsAllocated: BASE_ATTEMPTS[3], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[3], attemptsUsed: 4, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 4, baseAttemptsAllocated: BASE_ATTEMPTS[4], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[4] + 1, attemptsUsed: 5, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 5, baseAttemptsAllocated: BASE_ATTEMPTS[5], attemptsCarriedOver: 2, totalAttemptsAvailable: BASE_ATTEMPTS[5] + 2, attemptsUsed: 6, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 6, baseAttemptsAllocated: BASE_ATTEMPTS[6], attemptsCarriedOver: 3, totalAttemptsAvailable: BASE_ATTEMPTS[6] + 3, attemptsUsed: 7, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 7, baseAttemptsAllocated: BASE_ATTEMPTS[7], attemptsCarriedOver: 4, totalAttemptsAvailable: BASE_ATTEMPTS[7] + 4, attemptsUsed: 8, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 8, baseAttemptsAllocated: BASE_ATTEMPTS[8], attemptsCarriedOver: 5, totalAttemptsAvailable: BASE_ATTEMPTS[8] + 5, attemptsUsed: 9, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 9, baseAttemptsAllocated: BASE_ATTEMPTS[9], attemptsCarriedOver: 6, totalAttemptsAvailable: BASE_ATTEMPTS[9] + 6, attemptsUsed: 10, puttsInSunk: 3, positionScore: 3, status: "success" },
        ],
      },
      {
        sessionId: "seed-session-2",
        startTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
        endTime: Date.now() - 5 * 24 * 60 * 60 * 1000 + 900000,
        finalScore: 18,
        penaltyMode: true,
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        sessionSummary: {
          finalScore: 18,
          positionScores: [3, 3, 3, -2, 3, 3, -1, 3, 3],
          successfulPositions: 7,
          penaltyPositions: [4, 7],
          duration: 15,
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        positionScores: [3, 3, 3, -2, 3, 3, -1, 3, 3],
        positions: [
          { positionNumber: 1, baseAttemptsAllocated: BASE_ATTEMPTS[1], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[1], attemptsUsed: 3, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 2, baseAttemptsAllocated: BASE_ATTEMPTS[2], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[2], attemptsUsed: 4, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 3, baseAttemptsAllocated: BASE_ATTEMPTS[3], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[3], attemptsUsed: 5, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 4, baseAttemptsAllocated: BASE_ATTEMPTS[4], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[4], attemptsUsed: 8, puttsInSunk: 2, positionScore: -2, status: "continued-penalty" },
          { positionNumber: 5, baseAttemptsAllocated: BASE_ATTEMPTS[5], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[5], attemptsUsed: 6, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 6, baseAttemptsAllocated: BASE_ATTEMPTS[6], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[6] + 1, attemptsUsed: 7, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 7, baseAttemptsAllocated: BASE_ATTEMPTS[7], attemptsCarriedOver: 2, totalAttemptsAvailable: BASE_ATTEMPTS[7] + 2, attemptsUsed: 12, puttsInSunk: 2, positionScore: -1, status: "continued-penalty" },
          { positionNumber: 8, baseAttemptsAllocated: BASE_ATTEMPTS[8], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[8], attemptsUsed: 9, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 9, baseAttemptsAllocated: BASE_ATTEMPTS[9], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[9] + 1, attemptsUsed: 10, puttsInSunk: 3, positionScore: 3, status: "success" },
        ],
      },
      {
        sessionId: "seed-session-3",
        startTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
        endTime: Date.now() - 2 * 24 * 60 * 60 * 1000 + 1200000,
        finalScore: 12,
        penaltyMode: true,
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        sessionSummary: {
          finalScore: 12,
          positionScores: [3, 3, -3, 3, 3, -2, 3, -1, 3],
          successfulPositions: 6,
          penaltyPositions: [3, 6, 8],
          duration: 20,
          timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        positionScores: [3, 3, -3, 3, 3, -2, 3, -1, 3],
        positions: [
          { positionNumber: 1, baseAttemptsAllocated: BASE_ATTEMPTS[1], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[1], attemptsUsed: 3, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 2, baseAttemptsAllocated: BASE_ATTEMPTS[2], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[2], attemptsUsed: 3, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 3, baseAttemptsAllocated: BASE_ATTEMPTS[3], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[3] + 1, attemptsUsed: 9, puttsInSunk: 2, positionScore: -3, status: "continued-penalty" },
          { positionNumber: 4, baseAttemptsAllocated: BASE_ATTEMPTS[4], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[4], attemptsUsed: 5, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 5, baseAttemptsAllocated: BASE_ATTEMPTS[5], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[5] + 1, attemptsUsed: 6, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 6, baseAttemptsAllocated: BASE_ATTEMPTS[6], attemptsCarriedOver: 2, totalAttemptsAvailable: BASE_ATTEMPTS[6] + 2, attemptsUsed: 12, puttsInSunk: 2, positionScore: -2, status: "continued-penalty" },
          { positionNumber: 7, baseAttemptsAllocated: BASE_ATTEMPTS[7], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[7], attemptsUsed: 8, puttsInSunk: 3, positionScore: 3, status: "success" },
          { positionNumber: 8, baseAttemptsAllocated: BASE_ATTEMPTS[8], attemptsCarriedOver: 1, totalAttemptsAvailable: BASE_ATTEMPTS[8] + 1, attemptsUsed: 12, puttsInSunk: 2, positionScore: -1, status: "continued-penalty" },
          { positionNumber: 9, baseAttemptsAllocated: BASE_ATTEMPTS[9], attemptsCarriedOver: 0, totalAttemptsAvailable: BASE_ATTEMPTS[9], attemptsUsed: 10, puttsInSunk: 3, positionScore: 3, status: "success" },
        ],
      },
    ]

    for (const session of sampleSessions) {
      store.put(session)
    }

    return new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log("History seeded successfully")
        resolve()
      }
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error("Failed to seed history data:", error)
  }
}
