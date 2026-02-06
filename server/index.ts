import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  saveCurrentSession,
  loadCurrentSession,
  clearCurrentSession,
  archiveSession,
  getSessionHistory,
  deleteOldestSessions,
  getSessionById
} from './storage.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// Get current session
app.get('/api/session/current', (req, res) => {
  try {
    const session = loadCurrentSession()
    res.json(session)
  } catch (error) {
    console.error('Error loading current session:', error)
    res.status(500).json({ error: 'Failed to load current session' })
  }
})

// Save current session
app.post('/api/session/current', (req, res) => {
  try {
    const session = req.body
    saveCurrentSession(session)
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving current session:', error)
    res.status(500).json({ error: 'Failed to save current session' })
  }
})

// Clear current session
app.delete('/api/session/current', (req, res) => {
  try {
    const { sessionId } = req.body
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' })
    }
    clearCurrentSession(sessionId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error clearing current session:', error)
    res.status(500).json({ error: 'Failed to clear current session' })
  }
})

// Archive session
app.post('/api/session/archive', (req, res) => {
  try {
    const session = req.body
    archiveSession(session)
    res.json({ success: true })
  } catch (error) {
    console.error('Error archiving session:', error)
    res.status(500).json({ error: 'Failed to archive session' })
  }
})

// Get session history
app.get('/api/session/history', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
    const sessions = getSessionHistory(limit)
    res.json(sessions)
  } catch (error) {
    console.error('Error loading session history:', error)
    res.status(500).json({ error: 'Failed to load session history' })
  }
})

// Get specific session by ID
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const session = getSessionById(req.params.sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    res.json(session)
  } catch (error) {
    console.error('Error loading session:', error)
    res.status(500).json({ error: 'Failed to load session' })
  }
})

// Delete oldest sessions
app.delete('/api/session/oldest/:count', (req, res) => {
  try {
    const count = parseInt(req.params.count)
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({ error: 'Invalid count parameter' })
    }
    deleteOldestSessions(count)
    res.json({ success: true, deleted: count })
  } catch (error) {
    console.error('Error deleting oldest sessions:', error)
    res.status(500).json({ error: 'Failed to delete oldest sessions' })
  }
})

// Migration endpoint - import sessions from IndexedDB export
app.post('/api/migrate/import', (req, res) => {
  try {
    const sessions = req.body.sessions
    if (!Array.isArray(sessions)) {
      return res.status(400).json({ error: 'sessions must be an array' })
    }

    let imported = 0
    for (const session of sessions) {
      try {
        archiveSession(session)
        imported++
      } catch (error) {
        console.error('Error importing session:', session.sessionId, error)
      }
    }

    res.json({ success: true, imported, total: sessions.length })
  } catch (error) {
    console.error('Error importing sessions:', error)
    res.status(500).json({ error: 'Failed to import sessions' })
  }
})

// Serve static files from the React app
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// All other non-API routes serve the React app (SPA fallback)
app.use((req, res, next) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
    res.sendFile(path.join(distPath, 'index.html'))
  } else {
    next()
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API available at http://localhost:${PORT}/api`)
  console.log(`Health check at http://localhost:${PORT}/health`)
})
