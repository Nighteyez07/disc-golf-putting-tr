import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react"

interface GameControlsProps {
  onRecordSink: () => void
  onRecordMiss: () => void
  disabled?: boolean
}

export function GameControls({ 
  onRecordSink, 
  onRecordMiss, 
  disabled = false 
}: GameControlsProps) {
  return (
    <div className="bg-card px-5 py-6">
      <div className="flex gap-3">
        <Button
          onClick={onRecordSink}
          disabled={disabled}
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
          onClick={onRecordMiss}
          disabled={disabled}
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
