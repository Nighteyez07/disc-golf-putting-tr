import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Session } from "@/lib/types"
import { formatScore, formatDuration, getAccuracyColor } from "@/lib/game-logic"
import { Trophy } from "@phosphor-icons/react"

interface SessionCompleteDialogProps {
  open: boolean
  session: Session
  onRestart: () => void
  onClose: () => void
}

export function SessionCompleteDialog({ 
  open, 
  session, 
  onRestart, 
  onClose 
}: SessionCompleteDialogProps) {
  const summary = session.sessionSummary
  if (!summary) return null

  const successPositions = session.positions.filter(p => p.status === "success")
  const penaltyPositions = session.positions.filter(p => p.status === "continued-penalty")
  
  // Calculate total shots taken vs BASE attempts (not including carryover)
  const totalShotsTaken = session.positions.reduce((sum, pos) => sum + pos.attemptsUsed, 0)
  const totalBaseAttempts = session.positions.reduce((sum, pos) => sum + pos.baseAttemptsAllocated, 0)
  
  // Calculate average accuracy across all positions
  const totalPuttsMade = session.positions.reduce((sum, pos) => sum + pos.puttsInSunk, 0)
  const averageAccuracy = totalShotsTaken > 0 ? Math.round((totalPuttsMade / totalShotsTaken) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col items-center text-center mb-2">
            <Trophy size={56} weight="fill" className="text-primary mb-3" />
            <DialogTitle className="text-2xl">Round Complete!</DialogTitle>
            <DialogDescription className="mt-2">
              Great work! Here's your session summary.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Final Score */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Final Score</div>
            <div className="numeric text-4xl text-primary font-bold">
              {formatScore(summary.finalScore)}
            </div>
          </div>

          <Separator />

          {/* Session Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Session Duration</span>
              <span className="font-semibold text-sm">
                {formatDuration(summary.duration)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Successful Positions</span>
              <span className="font-semibold numeric text-sm">
                {successPositions.length}/9
              </span>
            </div>
            
            {penaltyPositions.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Penalty Positions</span>
                <span className="font-semibold numeric text-sm text-warning">
                  {penaltyPositions.length}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Shots Taken</span>
              <span className="font-semibold numeric text-sm">
                {totalShotsTaken} / {totalBaseAttempts}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Accuracy</span>
              <span className={`font-semibold numeric text-sm ${getAccuracyColor(averageAccuracy)}`}>
                {averageAccuracy}%
              </span>
            </div>
          </div>

          <Separator />

          {/* Position Scores */}
          <div>
            <div className="text-sm font-semibold mb-2">Position Breakdown:</div>
            <div className="grid grid-cols-3 gap-2">
              {session.positions.map((pos, i) => {
                const accuracy = pos.accuracyRate ?? (pos.puttsInSunk > 0 && pos.attemptsUsed > 0
                  ? Math.round((pos.puttsInSunk / pos.attemptsUsed) * 100)
                  : 0)
                return (
                  <div 
                    key={i}
                    className="text-center p-2 rounded bg-secondary"
                  >
                    <div className="text-xs text-muted-foreground mb-1">P{pos.positionNumber}</div>
                    <div className={`numeric text-sm font-bold ${
                      pos.status === "continued-penalty" ? 'text-warning' : 'text-foreground'
                    }`}>
                      {pos.attemptsUsed}/{pos.totalAttemptsAvailable}
                    </div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${getAccuracyColor(accuracy)}`}>
                      {accuracy}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            onClick={onRestart}
            className="w-full h-11 text-base font-semibold"
          >
            Start New Round
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-11 text-base font-semibold"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
