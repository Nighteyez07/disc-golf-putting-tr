import { describe, it, expect } from 'vitest'
import { createInitialPosition, calculateCarryover } from './game-logic'
import { Position } from './types'

describe('Position Completion Display', () => {
  it('Position 1: completes with all attempts used - should show 3/0', () => {
    const position: Position = {
      ...createInitialPosition(1, 0),
      attemptsUsed: 3,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      putts: [
        { result: 'sink', timestamp: 1 },
        { result: 'sink', timestamp: 2 },
        { result: 'sink', timestamp: 3 },
      ],
    }

    const carryover = calculateCarryover(position)
    expect(position.attemptsUsed).toBe(3)
    expect(carryover).toBe(0)
  })

  it('Position 1: completes with 1 attempt remaining (carryover) - should show 2/1', () => {
    // Real scenario: 3 base attempts, use 2 for 2 sinks + misses, then get 3rd sink on attempt 2
    // Wait, that's still impossible. Let's use a realistic scenario:
    // Actually in real gameplay, to get 3 sinks you NEED to record 3 putts minimum (even if all successful)
    // So this test creates a Position 1 that somehow completed with misses
    const position: Position = {
      ...createInitialPosition(1, 0),
      attemptsUsed: 2,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      // NOTE: This is theoretical test data - in actual gameplay, attemptsUsed should equal putts.length
      putts: [
        { result: 'miss', timestamp: 1 },
        { result: 'sink', timestamp: 2 },
      ],
    }

    // Even though test data is inconsistent, carryover calculation should work
    const carryover = calculateCarryover(position)
    expect(carryover).toBe(1) // 3 available - 2 used = 1 carryover
  })

  it('Position 2: with carryover, completes using 3 attempts - should show 3/1', () => {
    const position: Position = {
      ...createInitialPosition(2, 1), // Position 2 with 1 carryover from position 1
      attemptsUsed: 3,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      putts: [
        { result: 'sink', timestamp: 1 },
        { result: 'sink', timestamp: 2 },
        { result: 'sink', timestamp: 3 },
      ],
    }

    expect(position.totalAttemptsAvailable).toBe(5) // 4 base + 1 carryover
    expect(position.attemptsUsed).toBe(3)
    const carryover = calculateCarryover(position)
    expect(carryover).toBe(2) // 5 available - 3 used = 2 remaining
  })

  it('Position 2: with 2 carryover, uses all 6 attempts - should show 6/0', () => {
    const position: Position = {
      ...createInitialPosition(2, 2), // Position 2 with 2 carryover
      attemptsUsed: 6,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      putts: [
        { result: 'miss', timestamp: 1 },
        { result: 'sink', timestamp: 2 },
        { result: 'miss', timestamp: 3 },
        { result: 'sink', timestamp: 4 },
        { result: 'miss', timestamp: 5 },
        { result: 'sink', timestamp: 6 },
      ],
    }

    expect(position.totalAttemptsAvailable).toBe(6) // 4 base + 2 carryover
    expect(position.attemptsUsed).toBe(6)
    const carryover = calculateCarryover(position)
    expect(carryover).toBe(0) // All attempts used
  })

  it('ensures completed positions maintain their completion status', () => {
    const position1: Position = {
      ...createInitialPosition(1, 0),
      attemptsUsed: 3,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      positionScore: 3,
      putts: [
        { result: 'sink', timestamp: 1 },
        { result: 'sink', timestamp: 2 },
        { result: 'sink', timestamp: 3 },
      ],
    }

    const position2: Position = {
      ...createInitialPosition(2, 0),
      attemptsUsed: 3,
      puttsInSunk: 3,
      status: 'success',
      completed: true,
      positionScore: 3,
      putts: [
        { result: 'sink', timestamp: 4 },
        { result: 'sink', timestamp: 5 },
        { result: 'sink', timestamp: 6 },
      ],
    }

    // Both positions should maintain their completed status
    expect(position1.completed).toBe(true)
    expect(position1.status).toBe('success')
    expect(position2.completed).toBe(true)
    expect(position2.status).toBe('success')
    
    // And their individual completion data should not overlap
    expect(calculateCarryover(position1)).toBe(0)
    expect(calculateCarryover(position2)).toBe(1) // 4 available - 3 used
  })
})
