// Migration utility to export IndexedDB data for import to SQLite backend
// This file can be run in the browser console on the old version

// Type for unknown session data from IndexedDB
type UnknownSession = Record<string, unknown>

export async function exportIndexedDBData(): Promise<UnknownSession[]> {
  const DB_NAME = "DiscPuttingGameDB"
  const STORE_NAME = "sessions"
  const DB_VERSION = 1

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => {
        const sessions = getAllRequest.result as UnknownSession[]
        console.log('Exported sessions:', sessions)
        resolve(sessions)
      }

      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
  })
}

export async function importToBackend(sessions: UnknownSession[]): Promise<void> {
  const API_URL = '/api/migrate/import'
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions })
    })

    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Import result:', result)
    return result
  } catch (error) {
    console.error('Import error:', error)
    throw error
  }
}

// Helper function to download exported data as JSON file
export function downloadAsJson(data: unknown, filename: string = 'sessions-export.json'): void {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Main migration function
export async function migrateFromIndexedDB(): Promise<void> {
  try {
    console.log('Exporting IndexedDB data...')
    const sessions = await exportIndexedDBData()
    
    console.log(`Found ${sessions.length} sessions`)
    
    if (sessions.length === 0) {
      console.log('No sessions to migrate')
      return
    }

    // Download backup
    downloadAsJson(sessions, `disc-golf-backup-${Date.now()}.json`)
    console.log('Backup downloaded')

    // Import to backend
    console.log('Importing to backend...')
    await importToBackend(sessions)
    console.log('Migration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Browser console instructions
console.log(`
To migrate your data from IndexedDB to the new SQLite backend:

1. Run: await migrateFromIndexedDB()
   This will:
   - Export your existing session data
   - Download a backup JSON file
   - Import the data to the new backend

2. Or manually:
   const sessions = await exportIndexedDBData()
   downloadAsJson(sessions)
   await importToBackend(sessions)
`)
