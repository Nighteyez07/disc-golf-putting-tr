import { BASE_ATTEMPTS, Position, Session, SessionSummary, UndoHistoryEntry } from "./types"

export function createInitialPosition(positionNumber: number, carryover: number = 0): Position {
  const baseAttempts = BASE_ATTEMPTS[positionNumber]
  return {
    positionNumber,
    baseAttemptsAllocated: baseAttempts,
    attemptsCarriedOver: carryover,
    totalAttemptsAvailable: baseAttempts + carryover,
    attemptsUsed: 0,
    puttsInSunk: 0,
    positionScore: 0,
    status: "not-started",
    putts: [],
    completed: false,
  }
}

export function createNewSession(): Session {
  return {
    sessionId: crypto.randomUUID(),
    startTime: Date.now(),
    endTime: null,
    penaltyMode: false,
    currentPositionNumber: 1,
    finalScore: null,
    positions: Array.from({ length: 9 }, (_, i) => 
      createInitialPosition(i + 1, 0)
    ),
    sessionSummary: null,
  }
}

export function calculateCarryover(position: Position): number {
  if (position.status !== "success") return 0
  return Math.max(0, position.totalAttemptsAvailable - position.attemptsUsed)
}

export function calculatePositionScore(position: Position, penaltyMode: boolean): number {
  if (position.status === "success" && !penaltyMode) {
    return 3
  }
  
  if (position.status === "continued-penalty" || (penaltyMode && position.completed)) {
    const overageAttempts = position.attemptsUsed - position.totalAttemptsAvailable
    return Math.max(0, overageAttempts) * -1
  }
  
  return 0
}

export function calculateAccuracyRate(position: Position): number {
  if (position.attemptsUsed === 0) {
    return 0
  }
  return Math.round((position.puttsInSunk / position.attemptsUsed) * 100)
}

export function calculateSessionScore(session: Session): number {
  return session.positions.reduce((total, pos) => {
    if (pos.completed) {
      return total + pos.positionScore
    }
    return total
  }, 0)
}

export function createSessionSummary(session: Session): SessionSummary {
  const finalScore = calculateSessionScore(session)
  const positionScores = session.positions.map(p => p.positionScore)
  const successfulPositions = session.positions.filter(p => p.status === "success").length
  const penaltyPositions = session.positions
    .filter(p => p.status === "continued-penalty")
    .map(p => p.positionNumber)
  const duration = session.endTime ? (session.endTime - session.startTime) / 1000 / 60 : 0
  
  return {
    finalScore,
    positionScores,
    successfulPositions,
    penaltyPositions,
    duration,
    timestamp: session.startTime,
  }
}

export function getPositionName(positionNumber: number): string {
  return `Position ${positionNumber}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`
  }
  return `${Math.floor(minutes)}m ${Math.round((minutes % 1) * 60)}s`
}

export function formatScore(score: number): string {
  if (score > 0) return `+${score}`
  return score.toString()
}

export function getAccuracyColor(accuracyRate: number): string {
  if (accuracyRate >= 75) return "text-green-600 dark:text-green-500"
  if (accuracyRate >= 50) return "text-yellow-600 dark:text-yellow-500"
  return "text-red-600 dark:text-red-500"
}

/**
 * Creates a snapshot of the current position state for undo history
 */
export function createUndoSnapshot(
  positionIndex: number,
  position: Position,
  penaltyMode: boolean
): UndoHistoryEntry {
  return {
    positionIndex,
    position: structuredClone(position), // Deep clone using native API
    penaltyMode,
  }
}

/**
 * Checks if undo is allowed (position must not be completed)
 */
export function canUndo(
  undoHistory: UndoHistoryEntry[],
  currentPosition: Position
): boolean {
  return undoHistory.length > 0 && !currentPosition.completed
}

/**
 * Checks if redo is allowed
 */
export function canRedo(redoHistory: UndoHistoryEntry[]): boolean {
  return redoHistory.length > 0
}
