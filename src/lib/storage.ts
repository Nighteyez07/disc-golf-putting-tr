import { Session } from "./types"

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Initialize DB - now just a health check for the backend
export async function initDB(): Promise<void> {
  try {
    const response = await fetch('/health')
    if (!response.ok) {
      throw new Error('Backend health check failed')
    }
    console.log('Backend API is available')
  } catch (error) {
    console.error('Failed to connect to backend:', error)
    // Don't throw - allow app to start even if backend is temporarily unavailable
  }
}

export function saveCurrentSession(session: Session): void {
  try {
    // Save to API
    fetch(`${API_BASE_URL}/session/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    }).catch(error => {
      console.error('Failed to save session to backend:', error)
    })
  } catch (error) {
    console.error("Failed to save current session:", error)
  }
}

export function loadCurrentSession(): Session | null {
  try {
    // For now, we can't use async in this function without breaking the app
    // So we'll return null and let the app fetch from the backend on init
    // This is handled in App.tsx useEffect
    return null
  } catch (error) {
    console.error("Failed to load current session:", error)
    return null
  }
}

export async function loadCurrentSessionAsync(): Promise<Session | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/current`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to load current session:", error)
    return null
  }
}

export function clearCurrentSession(): void {
  try {
    // Note: We need the sessionId to clear properly
    // This will be handled by the app passing it explicitly
  } catch (error) {
    console.error("Failed to clear current session:", error)
  }
}

export async function clearCurrentSessionAsync(sessionId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/session/current`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    })
  } catch (error) {
    console.error("Failed to clear current session:", error)
  }
}

export async function archiveSession(session: Session): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    })
    
    if (!response.ok) {
      throw new Error('Failed to archive session')
    }
  } catch (error) {
    console.error("Failed to archive session:", error)
    throw error
  }
}

export async function getSessionHistory(): Promise<Session[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/history`)
    if (!response.ok) {
      return []
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to load session history:", error)
    return []
  }
}

export async function deleteOldestSessions(count: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/oldest/${count}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete oldest sessions')
    }
  } catch (error) {
    console.error("Failed to delete old sessions:", error)
    throw error
  }
}
