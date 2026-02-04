import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createInitialPosition,
  createNewSession,
  calculateCarryover,
  calculatePositionScore,
  calculateSessionScore,
  createSessionSummary,
  getPositionName,
  formatDuration,
  formatScore,
  createUndoSnapshot,
  canUndo,
  canRedo,
} from './game-logic'
import { Position, Session } from './types'

describe('createInitialPosition', () => {
  it('creates position with correct base attempts', () => {
    const position = createInitialPosition(1, 0)
    expect(position.positionNumber).toBe(1)
    expect(position.baseAttemptsAllocated).toBe(3)
    expect(position.totalAttemptsAvailable).toBe(3)
  })

  it('creates position with carryover attempts', () => {
    const position = createInitialPosition(5, 2)
    expect(position.positionNumber).toBe(5)
    expect(position.baseAttemptsAllocated).toBe(7)
    expect(position.attemptsCarriedOver).toBe(2)
    expect(position.totalAttemptsAvailable).toBe(9)
  })

  it('initializes position with correct default values', () => {
    const position = createInitialPosition(3, 0)
    expect(position.attemptsUsed).toBe(0)
    expect(position.puttsInSunk).toBe(0)
    expect(position.positionScore).toBe(0)
    expect(position.status).toBe('not-started')
    expect(position.putts).toEqual([])
    expect(position.completed).toBe(false)
  })

  it('creates positions with correct attempts for all positions', () => {
    const expectedAttempts = [3, 4, 5, 6, 7, 8, 9, 10, 11]
    expectedAttempts.forEach((expected, index) => {
      const position = createInitialPosition(index + 1, 0)
      expect(position.baseAttemptsAllocated).toBe(expected)
    })
  })

  it('handles no carryover correctly', () => {
    const position = createInitialPosition(2)
    expect(position.attemptsCarriedOver).toBe(0)
    expect(position.totalAttemptsAvailable).toBe(4)
  })
})

describe('createNewSession', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('test-uuid-123')
    vi.spyOn(Date, 'now').mockReturnValue(1000000)
  })

  it('creates session with 9 positions', () => {
    const session = createNewSession()
    expect(session.positions).toHaveLength(9)
  })

  it('initializes positions with correct base attempts', () => {
    const session = createNewSession()
    const expectedAttempts = [3, 4, 5, 6, 7, 8, 9, 10, 11]
    session.positions.forEach((pos, index) => {
      expect(pos.baseAttemptsAllocated).toBe(expectedAttempts[index])
    })
  })

  it('sets initial position number to 1', () => {
    const session = createNewSession()
    expect(session.currentPositionNumber).toBe(1)
  })

  it('generates unique session ID', () => {
    const session = createNewSession()
    expect(session.sessionId).toBe('test-uuid-123')
  })

  it('initializes all positions to not-started status', () => {
    const session = createNewSession()
    session.positions.forEach(pos => {
      expect(pos.status).toBe('not-started')
    })
  })

  it('initializes with correct default values', () => {
    const session = createNewSession()
    expect(session.startTime).toBe(1000000)
    expect(session.endTime).toBeNull()
    expect(session.penaltyMode).toBe(false)
    expect(session.finalScore).toBeNull()
    expect(session.sessionSummary).toBeNull()
  })

  it('initializes all positions without carryover', () => {
    const session = createNewSession()
    session.positions.forEach(pos => {
      expect(pos.attemptsCarriedOver).toBe(0)
    })
  })
})

describe('calculateCarryover', () => {
  it('returns 0 for non-success positions', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 2,
      puttsInSunk: 0,
      positionScore: 0,
      status: 'in-progress',
      putts: [],
      completed: false,
    }
    expect(calculateCarryover(position)).toBe(0)
  })

  it('calculates correct carryover for success with unused attempts', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 5,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 5,
      attemptsUsed: 3,
      puttsInSunk: 3,
      positionScore: 3,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(2)
  })

  it('returns 0 when all attempts were used', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 3,
      puttsInSunk: 3,
      positionScore: 3,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(0)
  })

  it('handles edge case of 0 attempts used', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 4,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 4,
      attemptsUsed: 0,
      puttsInSunk: 0,
      positionScore: 0,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(4)
  })

  it('returns 0 for failed-restart status', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 3,
      puttsInSunk: 0,
      positionScore: 0,
      status: 'failed-restart',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(0)
  })

  it('returns 0 for continued-penalty status', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 5,
      puttsInSunk: 3,
      positionScore: -2,
      status: 'continued-penalty',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(0)
  })

  it('handles carryover with additional carried over attempts', () => {
    const position: Position = {
      positionNumber: 2,
      baseAttemptsAllocated: 4,
      attemptsCarriedOver: 2,
      totalAttemptsAvailable: 6,
      attemptsUsed: 3,
      puttsInSunk: 3,
      positionScore: 3,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculateCarryover(position)).toBe(3)
  })
})

describe('calculatePositionScore', () => {
  it('returns 3 points for success outside penalty mode', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 3,
      puttsInSunk: 3,
      positionScore: 0,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculatePositionScore(position, false)).toBe(3)
  })

  it('calculates penalty for success in penalty mode with overage', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 5,
      puttsInSunk: 3,
      positionScore: 0,
      status: 'success',
      putts: [],
      completed: true,
    }
    expect(calculatePositionScore(position, true)).toBe(-2)
  })

  it('calculates negative penalty correctly', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 5,
      puttsInSunk: 3,
      positionScore: 0,
      status: 'continued-penalty',
      putts: [],
      completed: true,
    }
    expect(calculatePositionScore(position, true)).toBe(-2)
  })

  it('returns 0 for incomplete positions', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 1,
      puttsInSunk: 1,
      positionScore: 0,
      status: 'in-progress',
      putts: [],
      completed: false,
    }
    expect(calculatePositionScore(position, false)).toBe(0)
  })

  it('handles continued-penalty status correctly', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 6,
      puttsInSunk: 3,
      positionScore: 0,
      status: 'continued-penalty',
      putts: [],
      completed: true,
    }
    expect(calculatePositionScore(position, true)).toBe(-3)
  })

  it('returns 0 for not-started status', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 0,
      puttsInSunk: 0,
      positionScore: 0,
      status: 'not-started',
      putts: [],
      completed: false,
    }
    expect(calculatePositionScore(position, false)).toBe(0)
  })

  it('returns 0 for failed-restart status', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 3,
      puttsInSunk: 0,
      positionScore: 0,
      status: 'failed-restart',
      putts: [],
      completed: true,
    }
    expect(calculatePositionScore(position, false)).toBe(0)
  })

  it('handles penalty with no overage', () => {
    const position: Position = {
      positionNumber: 1,
      baseAttemptsAllocated: 3,
      attemptsCarriedOver: 0,
      totalAttemptsAvailable: 3,
      attemptsUsed: 3,
      puttsInSunk: 3,
      positionScore: 0,
      status: 'continued-penalty',
      putts: [],
      completed: true,
    }
    // When there's no overage, the result is -0 in JavaScript (0 * -1 = -0)
    // For practical purposes, -0 == 0, but Object.is distinguishes them
    const result = calculatePositionScore(position, true)
    expect(Math.abs(result)).toBe(0)
  })
})

describe('calculateSessionScore', () => {
  it('sums all completed position scores', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: Date.now(),
      endTime: null,
      penaltyMode: false,
      currentPositionNumber: 3,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3 },
        { ...createInitialPosition(2, 0), completed: true, positionScore: 3 },
        { ...createInitialPosition(3, 0), completed: true, positionScore: 3 },
      ],
    }
    expect(calculateSessionScore(session)).toBe(9)
  })

  it('ignores incomplete position scores', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: Date.now(),
      endTime: null,
      penaltyMode: false,
      currentPositionNumber: 2,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3 },
        { ...createInitialPosition(2, 0), completed: false, positionScore: 0 },
        { ...createInitialPosition(3, 0), completed: false, positionScore: 0 },
      ],
    }
    expect(calculateSessionScore(session)).toBe(3)
  })

  it('handles mix of positive and negative scores', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: Date.now(),
      endTime: null,
      penaltyMode: true,
      currentPositionNumber: 4,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3 },
        { ...createInitialPosition(2, 0), completed: true, positionScore: -2 },
        { ...createInitialPosition(3, 0), completed: true, positionScore: 3 },
        { ...createInitialPosition(4, 0), completed: false, positionScore: 0 },
      ],
    }
    expect(calculateSessionScore(session)).toBe(4)
  })

  it('returns 0 for new session', () => {
    const session = createNewSession()
    expect(calculateSessionScore(session)).toBe(0)
  })

  it('handles all negative scores', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: Date.now(),
      endTime: null,
      penaltyMode: true,
      currentPositionNumber: 3,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: -1 },
        { ...createInitialPosition(2, 0), completed: true, positionScore: -2 },
        { ...createInitialPosition(3, 0), completed: false, positionScore: 0 },
      ],
    }
    expect(calculateSessionScore(session)).toBe(-3)
  })
})

describe('createSessionSummary', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(2000000)
  })

  it('captures final score correctly', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: 2000000,
      penaltyMode: false,
      currentPositionNumber: 9,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
        { ...createInitialPosition(2, 0), completed: true, positionScore: 3, status: 'success' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.finalScore).toBe(6)
  })

  it('identifies all successful positions', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: 2000000,
      penaltyMode: false,
      currentPositionNumber: 3,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
        { ...createInitialPosition(2, 0), completed: true, positionScore: 0, status: 'failed-restart' },
        { ...createInitialPosition(3, 0), completed: true, positionScore: 3, status: 'success' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.successfulPositions).toBe(2)
  })

  it('lists penalty positions accurately', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: 2000000,
      penaltyMode: true,
      currentPositionNumber: 4,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
        { ...createInitialPosition(2, 0), completed: true, positionScore: -2, status: 'continued-penalty' },
        { ...createInitialPosition(3, 0), completed: true, positionScore: -1, status: 'continued-penalty' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.penaltyPositions).toEqual([2, 3])
  })

  it('calculates session duration', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: 2200000,
      penaltyMode: false,
      currentPositionNumber: 2,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.duration).toBe(20) // (2200000 - 1000000) / 1000 / 60 = 20 minutes
  })

  it('includes timestamp', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1500000,
      endTime: 2000000,
      penaltyMode: false,
      currentPositionNumber: 1,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.timestamp).toBe(1500000)
  })

  it('handles session without endTime', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: null,
      penaltyMode: false,
      currentPositionNumber: 1,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: false, positionScore: 0, status: 'in-progress' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.duration).toBe(0)
  })

  it('includes all position scores', () => {
    const session: Session = {
      sessionId: 'test-123',
      startTime: 1000000,
      endTime: 2000000,
      penaltyMode: true,
      currentPositionNumber: 4,
      finalScore: null,
      sessionSummary: null,
      positions: [
        { ...createInitialPosition(1, 0), completed: true, positionScore: 3, status: 'success' },
        { ...createInitialPosition(2, 0), completed: true, positionScore: -1, status: 'continued-penalty' },
        { ...createInitialPosition(3, 0), completed: true, positionScore: 0, status: 'failed-restart' },
      ],
    }
    const summary = createSessionSummary(session)
    expect(summary.positionScores).toEqual([3, -1, 0])
  })
})

describe('getPositionName', () => {
  it('returns correct position name', () => {
    expect(getPositionName(1)).toBe('Position 1')
    expect(getPositionName(5)).toBe('Position 5')
    expect(getPositionName(9)).toBe('Position 9')
  })
})

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(0.5)).toBe('30s')
    expect(formatDuration(0.25)).toBe('15s')
  })

  it('formats minutes correctly', () => {
    expect(formatDuration(1)).toBe('1m 0s')
    expect(formatDuration(5.5)).toBe('5m 30s')
  })

  it('handles zero duration', () => {
    expect(formatDuration(0)).toBe('0s')
  })
})

describe('formatScore', () => {
  it('formats positive scores with plus sign', () => {
    expect(formatScore(3)).toBe('+3')
    expect(formatScore(10)).toBe('+10')
  })

  it('formats negative scores without modification', () => {
    expect(formatScore(-1)).toBe('-1')
    expect(formatScore(-5)).toBe('-5')
  })

  it('formats zero score', () => {
    expect(formatScore(0)).toBe('0')
  })
})

describe('Undo/Redo functionality', () => {
  describe('createUndoSnapshot', () => {
    it('creates a snapshot of position state', () => {
      const position = createInitialPosition(1, 0)
      position.attemptsUsed = 2
      position.puttsInSunk = 1
      position.putts = [
        { result: 'sink', timestamp: Date.now() },
        { result: 'miss', timestamp: Date.now() }
      ]
      position.status = 'in-progress'
      
      const snapshot = createUndoSnapshot(0, position, false)
      
      expect(snapshot.positionIndex).toBe(0)
      expect(snapshot.position.attemptsUsed).toBe(2)
      expect(snapshot.position.puttsInSunk).toBe(1)
      expect(snapshot.position.putts).toHaveLength(2)
      expect(snapshot.position.status).toBe('in-progress')
      expect(snapshot.penaltyMode).toBe(false)
    })
    
    it('creates a deep copy of position', () => {
      const position = createInitialPosition(1, 0)
      position.putts = [{ result: 'sink', timestamp: Date.now() }]
      
      const snapshot = createUndoSnapshot(0, position, false)
      
      // Modify original position
      position.putts.push({ result: 'miss', timestamp: Date.now() })
      position.attemptsUsed = 5
      
      // Snapshot should remain unchanged
      expect(snapshot.position.putts).toHaveLength(1)
      expect(snapshot.position.attemptsUsed).toBe(0)
    })
    
    it('captures penalty mode state', () => {
      const position = createInitialPosition(1, 0)
      const snapshot = createUndoSnapshot(0, position, true)
      
      expect(snapshot.penaltyMode).toBe(true)
    })
  })
  
  describe('canUndo', () => {
    it('returns false when undo history is empty', () => {
      const position = createInitialPosition(1, 0)
      expect(canUndo([], position)).toBe(false)
    })
    
    it('returns false when position is completed', () => {
      const position = createInitialPosition(1, 0)
      position.completed = true
      const undoHistory = [createUndoSnapshot(0, position, false)]
      
      expect(canUndo(undoHistory, position)).toBe(false)
    })
    
    it('returns true when undo history exists and position not completed', () => {
      const position = createInitialPosition(1, 0)
      const undoHistory = [createUndoSnapshot(0, position, false)]
      
      expect(canUndo(undoHistory, position)).toBe(true)
    })
    
    it('returns true with multiple undo entries', () => {
      const position = createInitialPosition(1, 0)
      const undoHistory = [
        createUndoSnapshot(0, position, false),
        createUndoSnapshot(0, position, false),
        createUndoSnapshot(0, position, false)
      ]
      
      expect(canUndo(undoHistory, position)).toBe(true)
    })
  })
  
  describe('canRedo', () => {
    it('returns false when redo history is empty', () => {
      expect(canRedo([])).toBe(false)
    })
    
    it('returns true when redo history has entries', () => {
      const position = createInitialPosition(1, 0)
      const redoHistory = [createUndoSnapshot(0, position, false)]
      
      expect(canRedo(redoHistory)).toBe(true)
    })
    
    it('returns true with multiple redo entries', () => {
      const position = createInitialPosition(1, 0)
      const redoHistory = [
        createUndoSnapshot(0, position, false),
        createUndoSnapshot(0, position, false)
      ]
      
      expect(canRedo(redoHistory)).toBe(true)
    })
  })
})
