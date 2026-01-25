export type PuttResult = "sink" | "miss"

export interface Putt {
  result: PuttResult
  timestamp: number
}

export type PositionStatus = 
  | "not-started"
  | "in-progress" 
  | "success" 
  | "failed-restart" 
  | "continued-penalty"

export interface Position {
  positionNumber: number
  baseAttemptsAllocated: number
  attemptsCarriedOver: number
  totalAttemptsAvailable: number
  attemptsUsed: number
  puttsInSunk: number
  positionScore: number
  status: PositionStatus
  putts: Putt[]
  completed: boolean
}

export interface Session {
  sessionId: string
  startTime: number
  endTime: number | null
  penaltyMode: boolean
  currentPositionNumber: number
  finalScore: number | null
  positions: Position[]
  sessionSummary: SessionSummary | null
}

export interface SessionSummary {
  finalScore: number
  positionScores: number[]
  successfulPositions: number
  penaltyPositions: number[]
  duration: number
  timestamp: number
}

export const BASE_ATTEMPTS: Record<number, number> = {
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 9,
  8: 10,
  9: 11,
}
