import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  initDB,
  saveCurrentSession,
  loadCurrentSession,
  clearCurrentSession,
  archiveSession,
  loadCurrentSessionAsync,
  clearCurrentSessionAsync,
  getSessionHistory,
  deleteOldestSessions,
} from './storage'
import { createNewSession } from './game-logic'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch as any

describe('initDB', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('checks backend health', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' })
    })

    await initDB()
    expect(mockFetch).toHaveBeenCalledWith('/health')
  })

  it('handles backend unavailability gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(initDB()).resolves.not.toThrow()
    
    consoleErrorSpy.mockRestore()
  })
})

describe('saveCurrentSession', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('sends session to backend API', async () => {
    const session = createNewSession()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    saveCurrentSession(session)
    
    // Wait a bit for async call to complete
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Verify fetch was called
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/session/current'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      })
    )
  })

  it('handles backend errors gracefully', () => {
    const session = createNewSession()
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => saveCurrentSession(session)).not.toThrow()
    
    consoleErrorSpy.mockRestore()
  })
})

describe('loadCurrentSession', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('returns null (sync version)', () => {
    const result = loadCurrentSession()
    expect(result).toBeNull()
  })
})

describe('loadCurrentSessionAsync', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('fetches current session from backend', async () => {
    const session = createNewSession()
    session.sessionId = 'test-load-id'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => session
    })

    const loaded = await loadCurrentSessionAsync()
    expect(loaded).not.toBeNull()
    expect(loaded!.sessionId).toBe('test-load-id')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/session/current'))
  })

  it('returns null when backend returns 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    })

    const result = await loadCurrentSessionAsync()
    expect(result).toBeNull()
  })

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await loadCurrentSessionAsync()
    expect(result).toBeNull()
    
    consoleErrorSpy.mockRestore()
  })
})

describe('clearCurrentSessionAsync', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('sends delete request to backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    await clearCurrentSessionAsync('test-session-id')
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/session/current'),
      expect.objectContaining({
        method: 'DELETE',
        body: expect.stringContaining('test-session-id')
      })
    )
  })

  it('handles backend errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(clearCurrentSessionAsync('test-id')).resolves.not.toThrow()
    
    consoleErrorSpy.mockRestore()
  })
})

describe('archiveSession', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('sends session to archive endpoint', async () => {
    const session = createNewSession()
    session.sessionId = 'archive-test-id'
    session.endTime = Date.now()
    session.finalScore = 15
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    await archiveSession(session)
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/session/archive'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('throws on backend error', async () => {
    const session = createNewSession()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    await expect(archiveSession(session)).rejects.toThrow()
  })
})

describe('getSessionHistory', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('fetches session history from backend', async () => {
    const sessions = [createNewSession(), createNewSession()]
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sessions
    })

    const result = await getSessionHistory()
    expect(result).toEqual(sessions)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/session/history'))
  })

  it('returns empty array on error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getSessionHistory()
    expect(result).toEqual([])
    
    consoleErrorSpy.mockRestore()
  })
})

describe('deleteOldestSessions', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('sends delete request for oldest sessions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, deleted: 5 })
    })

    await deleteOldestSessions(5)
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/session/oldest/5'),
      expect.objectContaining({
        method: 'DELETE'
      })
    )
  })

  it('throws on backend error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    await expect(deleteOldestSessions(5)).rejects.toThrow()
  })
})
