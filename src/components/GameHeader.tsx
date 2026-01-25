import { Position } from "@/lib/types"
import { formatScore } from "@/lib/game-logic"
import { Button } from "@/components/ui/button"
import { ArrowCounterClockwise } from "@phosphor-icons/react"

interface GameHeaderProps {
  currentPosition: number
  totalPositions: number
  cumulativeScore: number
  position: Position
  penaltyMode: boolean
  onRestart: () => void
}

export function GameHeader({
  currentPosition,
  totalPositions,
  cumulativeScore,
  position,
  penaltyMode,
  onRestart,
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
        <div className="flex items-center gap-4">
          <div className="numeric text-primary">
            {formatScore(cumulativeScore)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRestart}
            className="h-9 w-9"
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
