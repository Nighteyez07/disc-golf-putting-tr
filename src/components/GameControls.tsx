import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "@phosphor-icons/react"

interface GameControlsProps {
  onRecordSink: () => void
  onRecordMiss: () => void
  disabled?: boolean
  sessionComplete?: boolean
}

export function GameControls({ 
  onRecordSink, 
  onRecordMiss, 
  disabled = false,
  sessionComplete = false
}: GameControlsProps) {
  // Buttons should be disabled if either processing a putt or session is complete
  const isDisabled = disabled || sessionComplete
  
  return (
    <div className="bg-card px-5 py-6">
      {sessionComplete && (
        <div className="text-center text-sm text-muted-foreground mb-3">
          Session complete. Close the completion dialog to start a new game.
        </div>
      )}
      <div className="flex gap-3">
        <Button
          onClick={onRecordSink}
          disabled={isDisabled}
          className="flex-1 h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <CheckCircle className="mr-2" size={24} weight="fill" />
          Sink
        </Button>
        <Button
          onClick={onRecordMiss}
          disabled={isDisabled}
          variant="outline"
          className="flex-1 h-14 text-lg font-semibold border-2"
        >
          <XCircle className="mr-2" size={24} weight="fill" />
          Miss
        </Button>
      </div>
    </div>
  )
}
