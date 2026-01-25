import { Position } from "@/lib/types"
import { formatScore } from "@/lib/game-logic"

interface GameHeaderProps {
  currentPosition: number
  totalPositions: number
  cumulativeScore: number
  position: Position
  penaltyMode: boolean
}

export function GameHeader({
  currentPosition,
  totalPositions,
  cumulativeScore,
  position,
  penaltyMode,
}: GameHeaderProps) {
  const attemptsText = position.attemptsCarriedOver > 0
    ? `${position.totalAttemptsAvailable} shots (${position.baseAttemptsAllocated} + ${position.attemptsCarriedOver} carry)`
    : `${position.totalAttemptsAvailable} shots`

  return (
    <div className="bg-card border-b-2 border-border px-5 py-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl">
          Position {currentPosition} of {totalPositions}
        </h1>
        <div className="numeric text-primary">
          {formatScore(cumulativeScore)}
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
