import { Position, Session } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowCounterClockwise, Book } from "@phosphor-icons/react"
import { ThemeToggle } from "@/components/ThemeToggle"

interface GameHeaderProps {
  currentPosition: number
  totalPositions: number
  cumulativeScore: number
  position: Position
  penaltyMode: boolean
  session: Session
  onRestart: () => void
  onShowInstructions?: () => void
}

export function GameHeader({
  currentPosition,
  totalPositions,
  position,
  penaltyMode,
  session,
  onRestart,
  onShowInstructions,
}: GameHeaderProps) {
  // Add null-safety check to prevent error when position is undefined during state transitions
  if (!position) {
    return null
  }

  // Calculate cumulative shots taken (includes current position's shots so far)
  // slice(0, currentPosition) gives positions 0 to currentPosition-1, which includes the current position
  const totalShotsTaken = session.positions
    .slice(0, currentPosition)
    .reduce((sum, pos) => sum + pos.attemptsUsed, 0)

  // Calculate cumulative attempts available (includes current position's total allocation)
  const totalAttemptsAvailable = session.positions
    .slice(0, currentPosition)
    .reduce((sum, pos) => sum + pos.totalAttemptsAvailable, 0)

  // Determine color based on progression
  const getProgressionColor = () => {
    if (totalShotsTaken < totalAttemptsAvailable) return "text-green-600"
    if (totalShotsTaken === totalAttemptsAvailable) return "text-orange-500"
    return "text-red-600"
  }

  const progressionColor = getProgressionColor()

  const attemptsText = position.attemptsCarriedOver > 0
    ? `${position.totalAttemptsAvailable} shots (${position.baseAttemptsAllocated} + ${position.attemptsCarriedOver} carry)`
    : `${position.totalAttemptsAvailable} shots`

  return (
    <div className="bg-card border-b-2 border-border px-5 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl">
          Position {currentPosition} of {totalPositions}
        </h1>
        <div className="flex items-center gap-4">
          <div className={`text-xl font-bold numeric ${progressionColor}`}>
            {totalShotsTaken}/{totalAttemptsAvailable}
          </div>
          <ThemeToggle />
          {onShowInstructions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowInstructions}
              className="h-9 w-9"
              aria-label="View instructions"
            >
              <Book className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRestart}
            className="h-9 w-9"
            aria-label="Restart session"
          >
            <ArrowCounterClockwise className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="text-base text-muted-foreground">
        {attemptsText}
      </div>
      {penaltyMode && (
        <div className="mt-2 text-sm font-semibold text-warning bg-warning/10 px-3 py-1 rounded-md inline-block">
          ⚠ PENALTY SCORING ACTIVE
        </div>
      )}
    </div>
  )
}
