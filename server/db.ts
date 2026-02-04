import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'disc-golf-trainer.db')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

export const db = new Database(DB_PATH, { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined 
})

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL')

// Create tables if they don't exist
export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      penalty_mode INTEGER NOT NULL DEFAULT 0,
      current_position_number INTEGER NOT NULL,
      final_score INTEGER,
      session_summary TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      position_number INTEGER NOT NULL,
      base_attempts_allocated INTEGER NOT NULL,
      attempts_carried_over INTEGER NOT NULL DEFAULT 0,
      total_attempts_available INTEGER NOT NULL,
      attempts_used INTEGER NOT NULL DEFAULT 0,
      putts_in_sunk INTEGER NOT NULL DEFAULT 0,
      position_score INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'not-started',
      completed INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_positions_session_id ON positions(session_id);

    CREATE TABLE IF NOT EXISTS putts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      position_number INTEGER NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('sink', 'miss')),
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_putts_session_id ON putts(session_id);
    CREATE INDEX IF NOT EXISTS idx_putts_position ON putts(session_id, position_number);
  `)

  console.log('Database initialized at:', DB_PATH)
}

// Initialize on module load
initializeDatabase()

export default db
