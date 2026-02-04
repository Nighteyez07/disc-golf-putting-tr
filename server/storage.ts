import db from './db.js'

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

export interface Position {
  positionNumber: number
  baseAttemptsAllocated: number
  attemptsCarriedOver: number
  totalAttemptsAvailable: number
  attemptsUsed: number
  puttsInSunk: number
  positionScore: number
  status: string
  putts: Putt[]
  completed: boolean
}

export interface Putt {
  result: 'sink' | 'miss'
  timestamp: number
}

export interface SessionSummary {
  finalScore: number
  positionScores: number[]
  successfulPositions: number
  penaltyPositions: number[]
  duration: number
  timestamp: number
}

// Save or update current session
export function saveCurrentSession(session: Session): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO sessions (
      session_id, start_time, end_time, penalty_mode, 
      current_position_number, final_score, session_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    session.sessionId,
    session.startTime,
    session.endTime,
    session.penaltyMode ? 1 : 0,
    session.currentPositionNumber,
    session.finalScore,
    session.sessionSummary ? JSON.stringify(session.sessionSummary) : null
  )

  // Delete existing positions and putts for this session
  db.prepare('DELETE FROM positions WHERE session_id = ?').run(session.sessionId)
  db.prepare('DELETE FROM putts WHERE session_id = ?').run(session.sessionId)

  // Insert positions
  const positionStmt = db.prepare(`
    INSERT INTO positions (
      session_id, position_number, base_attempts_allocated,
      attempts_carried_over, total_attempts_available, attempts_used,
      putts_in_sunk, position_score, status, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  // Insert putts
  const puttStmt = db.prepare(`
    INSERT INTO putts (session_id, position_number, result, timestamp)
    VALUES (?, ?, ?, ?)
  `)

  for (const position of session.positions) {
    positionStmt.run(
      session.sessionId,
      position.positionNumber,
      position.baseAttemptsAllocated,
      position.attemptsCarriedOver,
      position.totalAttemptsAvailable,
      position.attemptsUsed,
      position.puttsInSunk,
      position.positionScore,
      position.status,
      position.completed ? 1 : 0
    )

    // Insert putts for this position
    for (const putt of position.putts) {
      puttStmt.run(
        session.sessionId,
        position.positionNumber,
        putt.result,
        putt.timestamp
      )
    }
  }
}

// Load current session (most recent uncompleted session)
export function loadCurrentSession(): Session | null {
  const sessionRow = db.prepare(`
    SELECT * FROM sessions 
    WHERE end_time IS NULL 
    ORDER BY start_time DESC 
    LIMIT 1
  `).get() as any

  if (!sessionRow) {
    return null
  }

  return reconstructSession(sessionRow)
}

// Load a specific session by ID
export function getSessionById(sessionId: string): Session | null {
  const sessionRow = db.prepare(`
    SELECT * FROM sessions WHERE session_id = ?
  `).get(sessionId) as any

  if (!sessionRow) {
    return null
  }

  return reconstructSession(sessionRow)
}

// Clear current session (mark as ended)
export function clearCurrentSession(sessionId: string): void {
  db.prepare(`
    UPDATE sessions 
    SET end_time = ? 
    WHERE session_id = ? AND end_time IS NULL
  `).run(Date.now(), sessionId)
}

// Archive session (mark as completed)
export function archiveSession(session: Session): void {
  saveCurrentSession(session)
}

// Get session history (all completed sessions)
export function getSessionHistory(limit = 50): Session[] {
  const sessionRows = db.prepare(`
    SELECT * FROM sessions 
    WHERE end_time IS NOT NULL 
    ORDER BY start_time DESC 
    LIMIT ?
  `).all(limit) as any[]

  return sessionRows.map(row => reconstructSession(row))
}

// Delete old sessions
export function deleteOldestSessions(count: number): void {
  const oldestSessions = db.prepare(`
    SELECT session_id FROM sessions 
    WHERE end_time IS NOT NULL 
    ORDER BY start_time ASC 
    LIMIT ?
  `).all(count) as any[]

  const deleteStmt = db.prepare('DELETE FROM sessions WHERE session_id = ?')
  for (const session of oldestSessions) {
    deleteStmt.run(session.session_id)
  }
}

// Helper function to reconstruct a full session from database rows
function reconstructSession(sessionRow: any): Session {
  const positions = db.prepare(`
    SELECT * FROM positions 
    WHERE session_id = ? 
    ORDER BY position_number ASC
  `).all(sessionRow.session_id) as any[]

  const reconstructedPositions: Position[] = positions.map(posRow => {
    const putts = db.prepare(`
      SELECT result, timestamp FROM putts 
      WHERE session_id = ? AND position_number = ?
      ORDER BY timestamp ASC
    `).all(sessionRow.session_id, posRow.position_number) as any[]

    return {
      positionNumber: posRow.position_number,
      baseAttemptsAllocated: posRow.base_attempts_allocated,
      attemptsCarriedOver: posRow.attempts_carried_over,
      totalAttemptsAvailable: posRow.total_attempts_available,
      attemptsUsed: posRow.attempts_used,
      puttsInSunk: posRow.putts_in_sunk,
      positionScore: posRow.position_score,
      status: posRow.status,
      completed: posRow.completed === 1,
      putts: putts.map(p => ({
        result: p.result as 'sink' | 'miss',
        timestamp: p.timestamp
      }))
    }
  })

  return {
    sessionId: sessionRow.session_id,
    startTime: sessionRow.start_time,
    endTime: sessionRow.end_time,
    penaltyMode: sessionRow.penalty_mode === 1,
    currentPositionNumber: sessionRow.current_position_number,
    finalScore: sessionRow.final_score,
    sessionSummary: sessionRow.session_summary ? JSON.parse(sessionRow.session_summary) : null,
    positions: reconstructedPositions
  }
}
