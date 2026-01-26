import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Target, ArrowRight, TrendUp, XCircle, CheckCircle } from "@phosphor-icons/react"

interface InstructionsDialogProps {
  open: boolean
  onClose: () => void
}

export function InstructionsDialog({ open, onClose }: InstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target size={28} weight="duotone" className="text-primary" />
            How to Play
          </DialogTitle>
          <DialogDescription>
            Learn how to use the disc golf putting trainer to improve your putting skills
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Welcome Section */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Welcome to the Disc Golf Putting Trainer!</h3>
            <p className="text-sm text-muted-foreground">
              This app helps you practice disc golf putting with a structured 9-position training system. 
              Track your progress, improve consistency, and build muscle memory.
            </p>
          </section>

          {/* Game Objective */}
          <section>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Target size={20} weight="bold" className="text-primary" />
              Game Objective
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Complete all 9 positions by sinking 3 putts at each position. Successfully completing positions earns you 3 points each.
            </p>
          </section>

          {/* Position Progression */}
          <section>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <ArrowRight size={20} weight="bold" className="text-primary" />
              Position Progression
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Progress through positions 1 → 2 → 3 → ... → 9. Each position gets progressively more challenging:
            </p>
            <div className="bg-muted/50 rounded-md p-3 text-xs space-y-1">
              <div className="grid grid-cols-3 gap-2 font-mono">
                <span>Position 1: 3 attempts</span>
                <span>Position 2: 4 attempts</span>
                <span>Position 3: 5 attempts</span>
                <span>Position 4: 6 attempts</span>
                <span>Position 5: 7 attempts</span>
                <span>Position 6: 8 attempts</span>
                <span>Position 7: 9 attempts</span>
                <span>Position 8: 10 attempts</span>
                <span>Position 9: 11 attempts</span>
              </div>
            </div>
          </section>

          {/* Carryover Mechanics */}
          <section>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <TrendUp size={20} weight="bold" className="text-primary" />
              Carryover Mechanics
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Unused attempts carry over to the next position! If you complete Position 1 in 2 attempts, 
              the unused attempt transfers to Position 2, giving you extra shots.
            </p>
            <div className="bg-accent/50 rounded-md p-3 text-xs">
              <strong>Example:</strong> Complete Position 1 using 2/3 attempts → Position 2 gets 4 + 1 = 5 attempts total
            </div>
          </section>

          {/* Controls */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Controls</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} weight="fill" className="text-green-500 shrink-0" />
                <div>
                  <strong>Sink Button:</strong> Record a successful putt
                </div>
              </div>
              <div className="flex items-center gap-3">
                <XCircle size={20} weight="fill" className="text-red-500 shrink-0" />
                <div>
                  <strong>Miss Button:</strong> Record a missed putt
                </div>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                The position triangle at the top shows your putt history. Green = sink, Red = miss.
              </p>
            </div>
          </section>

          {/* Penalty Mode */}
          <section>
            <h3 className="text-lg font-semibold mb-2">⚠️ Penalty Scoring Mode</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If you run out of attempts before sinking 3 putts, you have two choices:
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li><strong>Restart:</strong> Start the entire session over from Position 1</li>
              <li><strong>Continue with Penalty:</strong> Keep going, but each extra attempt costs -1 point</li>
            </ul>
            <div className="bg-warning/10 border border-warning/30 rounded-md p-3 mt-2 text-xs">
              💡 Penalty mode helps you practice finishing positions even under pressure, but impacts your score.
            </div>
          </section>

          {/* Session Tracking */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Session Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Your progress is automatically saved every 10 seconds. You can safely close the app and 
              return later to continue your session. Completed sessions are stored in your history.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Got it! Let's Practice 🎯
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
