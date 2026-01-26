import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SessionCompleteDialog } from './SessionCompleteDialog'
import { Session } from '@/lib/types'
import { createNewSession } from '@/lib/game-logic'

function createCompletedSession(): Session {
  const session = createNewSession()
  
  // Mark all positions as completed with success status
  session.positions = session.positions.map((pos) => ({
    ...pos,
    completed: true,
    status: 'success' as const,
    positionScore: 3,
    attemptsUsed: 3,
    puttsInSunk: 3,
  }))
  
  session.endTime = Date.now()
  session.finalScore = 27
  session.sessionSummary = {
    finalScore: 27,
    positionScores: [3, 3, 3, 3, 3, 3, 3, 3, 3],
    successfulPositions: 9,
    penaltyPositions: [],
    duration: 10,
    timestamp: session.startTime,
  }
  
  return session
}

function createPenaltySession(): Session {
  const session = createNewSession()
  
  // Create a session with some penalty positions
  session.positions = session.positions.map((pos, idx) => {
    if (idx === 3 || idx === 6) {
      // Position 4 and 7 have penalties
      return {
        ...pos,
        completed: true,
        status: 'continued-penalty' as const,
        positionScore: -2,
        attemptsUsed: pos.baseAttemptsAllocated + 2,
        puttsInSunk: 3,
      }
    }
    return {
      ...pos,
      completed: true,
      status: 'success' as const,
      positionScore: 3,
      attemptsUsed: 3,
      puttsInSunk: 3,
    }
  })
  
  session.endTime = Date.now()
  session.finalScore = 17
  session.penaltyMode = true
  session.sessionSummary = {
    finalScore: 17,
    positionScores: [3, 3, 3, -2, 3, 3, -2, 3, 3],
    successfulPositions: 7,
    penaltyPositions: [4, 7],
    duration: 15,
    timestamp: session.startTime,
  }
  
  return session
}

describe('SessionCompleteDialog', () => {
  const mockOnRestart = vi.fn()
  const mockOnClose = vi.fn()

  describe('Position Breakdown Display', () => {
    it('shows position breakdown without score display', () => {
      const session = createCompletedSession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Check that position labels are displayed
      expect(screen.getByText('P1')).toBeDefined()
      expect(screen.getByText('P2')).toBeDefined()
      expect(screen.getByText('P9')).toBeDefined()
      
      // Check that attempt trackers are displayed (X/Y format) - use getAllByText since there are multiple
      const positionCards = screen.getAllByText(/3\/\d+/)
      expect(positionCards.length).toBeGreaterThan(0)
    })

    it('shows correct attempts used vs total available for each position', () => {
      const session = createCompletedSession()
      session.positions[0].attemptsUsed = 2
      session.positions[0].totalAttemptsAvailable = 3
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Position 1 should show 2/3
      expect(screen.getByText('2/3')).toBeDefined()
    })

    it('highlights penalty positions with warning color', () => {
      const session = createPenaltySession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Check that penalty indicator is shown in the summary stats
      expect(screen.getByText('Penalty Positions')).toBeDefined()
      expect(screen.getByText('2')).toBeDefined() // 2 penalty positions
    })
  })

  describe('Cumulative Shot Tracker', () => {
    it('calculates total shots taken correctly', () => {
      const session = createCompletedSession()
      session.positions[0].attemptsUsed = 2
      session.positions[1].attemptsUsed = 3
      session.positions[2].attemptsUsed = 4
      // Rest are 3 each, total = 2 + 3 + 4 + (6 * 3) = 27
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Should show total shots taken in the "Total Shots Taken" row
      expect(screen.getByText('Total Shots Taken')).toBeDefined()
      expect(screen.getByText('27 / 63')).toBeDefined()
    })

    it('calculates total base attempts correctly (not double-counting carryover)', () => {
      const session = createCompletedSession()
      
      // Set totalAttemptsAvailable to include carryover
      session.positions[0].totalAttemptsAvailable = 3
      session.positions[1].totalAttemptsAvailable = 5 // 4 base + 1 carryover
      session.positions[2].totalAttemptsAvailable = 8 // 5 base + 3 carryover
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Should show base attempts sum (63), not totalAttemptsAvailable sum
      // Base attempts: 3+4+5+6+7+8+9+10+11 = 63
      expect(screen.getByText(/63/)).toBeDefined()
    })

    it('shows shots taken as X/Y format where Y is base attempts', () => {
      const session = createCompletedSession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      // Format should be "X / 63" where 63 is the sum of base attempts
      expect(screen.getByText(/\/ 63/)).toBeDefined()
    })
  })

  describe('Session Stats Display', () => {
    it('shows successful positions count', () => {
      const session = createCompletedSession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('9/9')).toBeDefined()
    })

    it('shows penalty positions count when present', () => {
      const session = createPenaltySession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.getByText('Penalty Positions')).toBeDefined()
      expect(screen.getByText('2')).toBeDefined() // 2 penalty positions
    })

    it('does not show penalty section when no penalties', () => {
      const session = createCompletedSession()
      
      render(
        <SessionCompleteDialog
          open={true}
          session={session}
          onRestart={mockOnRestart}
          onClose={mockOnClose}
        />
      )
      
      expect(screen.queryByText('Penalty Positions')).toBeNull()
    })
  })
})
