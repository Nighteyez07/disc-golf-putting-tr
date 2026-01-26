import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Session } from "@/lib/types"
import { formatScore, formatDuration } from "@/lib/game-logic"
import { Trophy, ChartLine } from "@phosphor-icons/react"

interface SessionCompleteProps {
  session: Session
  onNewGame: () => void
  onViewHistory: () => void
}

export function SessionComplete({ 
  session, 
  onNewGame, 
  onViewHistory 
}: SessionCompleteProps) {
  const summary = session.sessionSummary
  if (!summary) return null

  const successPositions = session.positions.filter(p => p.status === "success")
  const penaltyPositions = session.positions.filter(p => p.status === "continued-penalty")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Trophy size={64} weight="fill" className="mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
          <div className="numeric text-5xl text-primary mb-2">
            {formatScore(summary.finalScore)}
          </div>
          <div className="text-muted-foreground">
            {formatDuration(summary.duration)}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Successful Positions</span>
            <span className="font-semibold numeric">
              {successPositions.length}/9
            </span>
          </div>
          
          {penaltyPositions.length > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Penalty Positions</span>
              <span className="font-semibold numeric text-warning">
                {penaltyPositions.length}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Shots Taken</span>
            <span className="font-semibold numeric">
              {session.positions.reduce((sum, pos) => sum + pos.attemptsUsed, 0)} / {session.positions.reduce((sum, pos) => sum + pos.baseAttemptsAllocated, 0)}
            </span>
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <div className="font-semibold mb-2">Position Breakdown:</div>
            <div className="grid grid-cols-3 gap-2">
              {session.positions.map((pos, i) => (
                <div 
                  key={i}
                  className="text-center p-2 rounded bg-secondary"
                >
                  <div className="text-xs text-muted-foreground mb-1">P{pos.positionNumber}</div>
                  <div className={`numeric text-sm font-bold ${
                    pos.positionScore < 0 ? 'text-warning' : 'text-foreground'
                  }`}>
                    {pos.attemptsUsed}/{pos.totalAttemptsAvailable}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={onNewGame}
            className="w-full h-12 text-base font-semibold"
          >
            Start New Game
          </Button>
          <Button
            onClick={onViewHistory}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            <ChartLine className="mr-2" size={20} />
            View History
          </Button>
        </div>
      </Card>
    </div>
  )
}
