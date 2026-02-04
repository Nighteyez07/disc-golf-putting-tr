import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react"
import { haptics } from "@/lib/haptics"

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
  
  const handleSink = () => {
    haptics.sink()
    onRecordSink()
  }
  
  const handleMiss = () => {
    haptics.miss()
    onRecordMiss()
  }
  
  return (
    <div className="bg-card px-5 py-6">
      {sessionComplete && (
        <div className="text-center text-sm text-muted-foreground mb-3">
          Session complete. Close the completion dialog to start a new game.
        </div>
      )}
      <div className="flex gap-3">
        <Button
          onClick={handleSink}
          disabled={isDisabled}
          className="flex-1 h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? (
            <>
              <CircleNotch className="mr-2 animate-spin" size={24} weight="bold" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2" size={24} weight="fill" />
              Sink
            </>
          )}
        </Button>
        <Button
          onClick={handleMiss}
          disabled={isDisabled}
          variant="outline"
          className="flex-1 h-14 text-lg font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? (
            <>
              <CircleNotch className="mr-2 animate-spin" size={24} weight="bold" />
              Processing...
            </>
          ) : (
            <>
              <XCircle className="mr-2" size={24} weight="fill" />
              Miss
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
