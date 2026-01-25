import { Session } from "./types"

const CURRENT_SESSION_KEY = "current_session"
const DB_NAME = "DiscPuttingGameDB"
const STORE_NAME = "sessions"
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "sessionId" })
        objectStore.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

export function saveCurrentSession(session: Session): void {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error("Failed to save current session:", error)
  }
}

export function loadCurrentSession(): Session | null {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_KEY)
    if (!stored) return null
    return JSON.parse(stored) as Session
  } catch (error) {
    console.error("Failed to load current session:", error)
    return null
  }
}

export function clearCurrentSession(): void {
  try {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  } catch (error) {
    console.error("Failed to clear current session:", error)
  }
}

export async function archiveSession(session: Session): Promise<void> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    
    const sessionData = {
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      finalScore: session.finalScore,
      penaltyMode: session.penaltyMode,
      sessionSummary: session.sessionSummary,
      positionScores: session.positions.map(p => p.positionScore),
    }
    
    store.put(sessionData)
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error("Failed to archive session:", error)
  }
}

export async function getSessionHistory(): Promise<Session[]> {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], "readonly")
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index("timestamp")
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev")
      const results: Session[] = []
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }
      
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Failed to load session history:", error)
    return []
  }
}

export async function deleteOldestSessions(count: number): Promise<void> {
  try {
    const db = await initDB()
    const sessions = await getSessionHistory()
    const oldestSessions = sessions.slice(-count)
    
    const transaction = db.transaction([STORE_NAME], "readwrite")
    const store = transaction.objectStore(STORE_NAME)
    
    for (const session of oldestSessions) {
      store.delete(session.sessionId)
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  } catch (error) {
    console.error("Failed to delete old sessions:", error)
  }
}
