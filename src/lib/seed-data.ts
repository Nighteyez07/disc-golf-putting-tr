import { initDB } from "./storage"

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
