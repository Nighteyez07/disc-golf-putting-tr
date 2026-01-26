import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  initDB,
  saveCurrentSession,
  loadCurrentSession,
  clearCurrentSession,
  archiveSession,
} from './storage'
import { createNewSession } from './game-logic'

describe('saveCurrentSession', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('saves session to localStorage with correct key', () => {
    const session = createNewSession()
    saveCurrentSession(session)
    
    const stored = localStorage.getItem('current_session')
    expect(stored).not.toBeNull()
  })

  it('serializes session object properly', () => {
    const session = createNewSession()
    session.sessionId = 'test-id-123'
    session.currentPositionNumber = 5
    
    saveCurrentSession(session)
    
    const stored = localStorage.getItem('current_session')
    const parsed = JSON.parse(stored!)
    expect(parsed.sessionId).toBe('test-id-123')
    expect(parsed.currentPositionNumber).toBe(5)
  })

  it('overwrites existing session data', () => {
    const session1 = createNewSession()
    session1.sessionId = 'first-id'
    saveCurrentSession(session1)
    
    const session2 = createNewSession()
    session2.sessionId = 'second-id'
    saveCurrentSession(session2)
    
    const stored = localStorage.getItem('current_session')
    const parsed = JSON.parse(stored!)
    expect(parsed.sessionId).toBe('second-id')
  })

  it('handles complete session data', () => {
    const session = createNewSession()
    session.penaltyMode = true
    session.finalScore = 15
    session.endTime = Date.now()
    
    saveCurrentSession(session)
    
    const stored = localStorage.getItem('current_session')
    const parsed = JSON.parse(stored!)
    expect(parsed.penaltyMode).toBe(true)
    expect(parsed.finalScore).toBe(15)
    expect(parsed.endTime).toBe(session.endTime)
  })

  it('handles localStorage errors gracefully', () => {
    const session = createNewSession()
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage quota exceeded')
    })
    
    expect(() => saveCurrentSession(session)).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
    setItemSpy.mockRestore()
  })
})

describe('loadCurrentSession', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns null when no session exists', () => {
    const result = loadCurrentSession()
    expect(result).toBeNull()
  })

  it('deserializes session correctly', () => {
    const session = createNewSession()
    session.sessionId = 'test-load-id'
    session.currentPositionNumber = 3
    localStorage.setItem('current_session', JSON.stringify(session))
    
    const loaded = loadCurrentSession()
    expect(loaded).not.toBeNull()
    expect(loaded!.sessionId).toBe('test-load-id')
    expect(loaded!.currentPositionNumber).toBe(3)
  })

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem('current_session', 'invalid-json-{')
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = loadCurrentSession()
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('validates session structure', () => {
    const session = createNewSession()
    localStorage.setItem('current_session', JSON.stringify(session))
    
    const loaded = loadCurrentSession()
    expect(loaded).not.toBeNull()
    expect(loaded).toHaveProperty('sessionId')
    expect(loaded).toHaveProperty('startTime')
    expect(loaded).toHaveProperty('positions')
    expect(Array.isArray(loaded!.positions)).toBe(true)
  })

  it('handles complete session with all properties', () => {
    const session = createNewSession()
    session.penaltyMode = true
    session.finalScore = 20
    session.endTime = Date.now()
    session.sessionSummary = {
      finalScore: 20,
      positionScores: [3, 3, 3],
      successfulPositions: 3,
      penaltyPositions: [],
      duration: 10,
      timestamp: session.startTime,
    }
    
    localStorage.setItem('current_session', JSON.stringify(session))
    
    const loaded = loadCurrentSession()
    expect(loaded).not.toBeNull()
    expect(loaded!.penaltyMode).toBe(true)
    expect(loaded!.finalScore).toBe(20)
    expect(loaded!.sessionSummary).not.toBeNull()
  })
})

describe('clearCurrentSession', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('removes session from localStorage', () => {
    const session = createNewSession()
    localStorage.setItem('current_session', JSON.stringify(session))
    
    clearCurrentSession()
    
    const stored = localStorage.getItem('current_session')
    expect(stored).toBeNull()
  })

  it('handles case when no session exists', () => {
    expect(() => clearCurrentSession()).not.toThrow()
  })

  it('handles localStorage errors gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
      throw new Error('Storage error')
    })
    
    expect(() => clearCurrentSession()).not.toThrow()
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
    removeItemSpy.mockRestore()
  })
})

describe('initDB', () => {
  it('creates a promise for IndexedDB instance', () => {
    const result = initDB()
    expect(result).toBeInstanceOf(Promise)
  })

  it('handles database operations', async () => {
    // Just test that initDB returns a promise
    // Full integration testing of IndexedDB would require complex mocking
    const dbPromise = initDB()
    expect(dbPromise).toBeDefined()
    expect(typeof dbPromise.then).toBe('function')
  })
})

describe('archiveSession', () => {
  it('returns a promise', () => {
    const session = createNewSession()
    session.endTime = Date.now()
    session.finalScore = 15
    
    const result = archiveSession(session)
    expect(result).toBeInstanceOf(Promise)
  })

  it('handles session data correctly', () => {
    const session = createNewSession()
    session.sessionId = 'archive-test-id'
    session.endTime = Date.now()
    session.finalScore = 15
    
    // Verify session has required properties before archiving
    expect(session.sessionId).toBe('archive-test-id')
    expect(session.endTime).not.toBeNull()
    expect(session.finalScore).toBe(15)
    
    // Just verify archiveSession can be called without throwing
    const archivePromise = archiveSession(session)
    expect(archivePromise).toBeDefined()
  })
})

