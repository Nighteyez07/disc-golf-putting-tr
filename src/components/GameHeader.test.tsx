import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameHeader } from './GameHeader'
import { Session, Position } from '@/lib/types'
import { createNewSession, createInitialPosition } from '@/lib/game-logic'

// Helper function to create a mock session with specific position states
function createMockSession(overrides?: Partial<Session>): Session {
  const session = createNewSession()
  return {
    ...session,
    ...overrides,
  }
}

// Helper function to create a position with specific attempts
function createPositionWithAttempts(
  positionNumber: number,
  attemptsUsed: number,
  totalAttemptsAvailable: number,
  completed: boolean = false
): Position {
  const position = createInitialPosition(positionNumber)
  return {
    ...position,
    attemptsUsed,
    totalAttemptsAvailable,
    completed,
  }
}

describe('GameHeader - Progression Tracker', () => {
  describe('Calculation Logic', () => {
    it('shows 0/3 at start of Position 1', () => {
      const session = createMockSession()
      const currentPosition = session.positions[0]

      render(
        <GameHeader
          currentPosition={1}
          totalPositions={9}
          cumulativeScore={0}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // At Position 1 start: 0 shots taken, 3 attempts available
      expect(screen.getByText('0/3')).toBeInTheDocument()
    })

    it('shows 3/7 at start of Position 2 after perfect Position 1', () => {
      const session = createMockSession()
      // Position 1: 3 attempts used, 3 total available, completed
      session.positions[0] = createPositionWithAttempts(1, 3, 3, true)
      // Position 2: 4 base attempts
      session.currentPositionNumber = 2
      const currentPosition = session.positions[1]

      render(
        <GameHeader
          currentPosition={2}
          totalPositions={9}
          cumulativeScore={3}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 3 (P1), Total attempts: 3 (P1) + 4 (P2) = 7
      expect(screen.getByText('3/7')).toBeInTheDocument()
    })

    it('shows 6/12 at start of Position 3 after perfect game', () => {
      const session = createMockSession()
      // Position 1: 3 attempts used, 3 total available
      session.positions[0] = createPositionWithAttempts(1, 3, 3, true)
      // Position 2: 3 attempts used, 4 total available
      session.positions[1] = createPositionWithAttempts(2, 3, 4, true)
      session.currentPositionNumber = 3
      const currentPosition = session.positions[2]

      render(
        <GameHeader
          currentPosition={3}
          totalPositions={9}
          cumulativeScore={6}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 3 + 3 = 6, Total attempts: 3 + 4 + 5 = 12
      expect(screen.getByText('6/12')).toBeInTheDocument()
    })

    it('shows 9/12 at Position 3 with some misses', () => {
      const session = createMockSession()
      // Position 1: 4 attempts used (1 miss), 3 total available
      session.positions[0] = createPositionWithAttempts(1, 4, 3, true)
      // Position 2: 5 attempts used (2 misses), 4 total available
      session.positions[1] = createPositionWithAttempts(2, 5, 4, true)
      session.currentPositionNumber = 3
      const currentPosition = session.positions[2]

      render(
        <GameHeader
          currentPosition={3}
          totalPositions={9}
          cumulativeScore={0}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 4 + 5 = 9, Total attempts: 3 + 4 + 5 = 12
      expect(screen.getByText('9/12')).toBeInTheDocument()
    })

    it('shows shots > attempts in penalty mode', () => {
      const session = createMockSession()
      // Position 1: 5 attempts used, 3 total available
      session.positions[0] = createPositionWithAttempts(1, 5, 3, true)
      // Position 2: 7 attempts used, 4 total available
      session.positions[1] = createPositionWithAttempts(2, 7, 4, true)
      // Position 3: 3 attempts used, 5 total available
      session.positions[2] = createPositionWithAttempts(3, 3, 5, true)
      session.currentPositionNumber = 4
      session.penaltyMode = true
      const currentPosition = session.positions[3]

      render(
        <GameHeader
          currentPosition={4}
          totalPositions={9}
          cumulativeScore={-3}
          position={currentPosition}
          penaltyMode={true}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 5 + 7 + 3 = 15, Total attempts: 3 + 4 + 5 + 6 = 18
      expect(screen.getByText('15/18')).toBeInTheDocument()
    })
  })

  describe('Color Coding', () => {
    it('displays green when shots < attempts', () => {
      const session = createMockSession()
      session.positions[0] = createPositionWithAttempts(1, 3, 3, true)
      session.currentPositionNumber = 2
      const currentPosition = session.positions[1]

      const { container } = render(
        <GameHeader
          currentPosition={2}
          totalPositions={9}
          cumulativeScore={3}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      const progressionTracker = screen.getByText('3/7')
      expect(progressionTracker).toHaveClass('text-green-600')
    })

    it('displays orange when shots = attempts', () => {
      const session = createMockSession()
      // Set up scenario where shots = attempts exactly
      session.positions[0] = createPositionWithAttempts(1, 3, 3, true)
      session.positions[1] = createPositionWithAttempts(2, 4, 4, true)
      session.currentPositionNumber = 3
      const currentPosition = session.positions[2]

      const { container } = render(
        <GameHeader
          currentPosition={3}
          totalPositions={9}
          cumulativeScore={6}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 3 + 4 = 7, Total attempts: 3 + 4 + 5 = 12
      // This is still green because 7 < 12
      const progressionTracker = screen.getByText('7/12')
      expect(progressionTracker).toHaveClass('text-green-600')
    })

    it('displays orange when cumulative shots equals cumulative attempts', () => {
      const session = createMockSession()
      // Set up scenario where total shots = total attempts
      // Position 1: 3 shots, 3 attempts
      session.positions[0] = createPositionWithAttempts(1, 3, 3, true)
      // Position 2: 4 shots, 4 attempts
      session.positions[1] = createPositionWithAttempts(2, 4, 4, true)
      // Position 3: 5 shots, 5 attempts
      session.positions[2] = createPositionWithAttempts(3, 5, 5, false)
      session.currentPositionNumber = 3
      const currentPosition = session.positions[2]

      const { container } = render(
        <GameHeader
          currentPosition={3}
          totalPositions={9}
          cumulativeScore={0}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 3 + 4 + 5 = 12, Total attempts: 3 + 4 + 5 = 12
      const progressionTracker = screen.getByText('12/12')
      expect(progressionTracker).toHaveClass('text-orange-500')
    })

    it('displays red when shots > attempts', () => {
      const session = createMockSession()
      // Position 1: More attempts used than available (penalty)
      session.positions[0] = createPositionWithAttempts(1, 5, 3, true)
      session.positions[1] = createPositionWithAttempts(2, 6, 4, false)
      session.currentPositionNumber = 2
      const currentPosition = session.positions[1]

      const { container } = render(
        <GameHeader
          currentPosition={2}
          totalPositions={9}
          cumulativeScore={-2}
          position={currentPosition}
          penaltyMode={true}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 5 + 6 = 11, Total attempts: 3 + 4 = 7
      const progressionTracker = screen.getByText('11/7')
      expect(progressionTracker).toHaveClass('text-red-600')
    })
  })

  describe('Edge Cases', () => {
    it('handles Position 1 with 1 shot taken', () => {
      const session = createMockSession()
      session.positions[0] = {
        ...session.positions[0],
        attemptsUsed: 1,
      }
      const currentPosition = session.positions[0]

      render(
        <GameHeader
          currentPosition={1}
          totalPositions={9}
          cumulativeScore={0}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      expect(screen.getByText('1/3')).toBeInTheDocument()
    })

    it('handles final position (9) correctly', () => {
      const session = createMockSession()
      // Fill in all previous positions with data
      for (let i = 0; i < 8; i++) {
        session.positions[i] = createPositionWithAttempts(
          i + 1,
          3, // All perfect
          [3, 4, 5, 6, 7, 8, 9, 10][i],
          true
        )
      }
      session.currentPositionNumber = 9
      const currentPosition = session.positions[8]

      render(
        <GameHeader
          currentPosition={9}
          totalPositions={9}
          cumulativeScore={24}
          position={currentPosition}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      // Shots taken: 3+3+3+3+3+3+3+3 = 24
      // Total attempts: 3+4+5+6+7+8+9+10+11 = 63
      expect(screen.getByText('24/63')).toBeInTheDocument()
    })

    it('returns null when position is undefined', () => {
      const session = createMockSession()

      const { container } = render(
        <GameHeader
          currentPosition={1}
          totalPositions={9}
          cumulativeScore={0}
          position={null as any}
          penaltyMode={false}
          session={session}
          onRestart={() => {}}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })
})
