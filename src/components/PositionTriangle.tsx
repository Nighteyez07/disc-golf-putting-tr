import { Position } from "@/lib/types"
import { cn } from "@/lib/utils"
import { calculateCarryover } from "@/lib/game-logic"

interface PositionTriangleProps {
  positions: Position[]
  currentPosition: number
  onSelectPosition?: (positionNumber: number) => void
}

export function PositionTriangle({ 
  positions, 
  currentPosition,
  onSelectPosition 
}: PositionTriangleProps) {
  const renderPosition = (position: Position) => {
    const isCurrent = position.positionNumber === currentPosition
    const isComplete = position.completed
    const isSuccess = position.status === "success"
    const isPenalty = position.status === "continued-penalty"
    
    // Calculate carryover for completed positions
    const carryover = isComplete ? calculateCarryover(position) : 0
    
    return (
      <button
        key={position.positionNumber}
        onClick={() => onSelectPosition?.(position.positionNumber)}
        disabled={position.positionNumber !== currentPosition}
        className={cn(
          "w-14 h-14 rounded-full font-bold transition-all duration-200",
          "flex items-center justify-center relative",
          "disabled:cursor-default",
          // Current position (in progress)
          isCurrent && !isComplete && "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/30",
          // Completed with success - NEW DESIGN: thin green border with ratio
          isComplete && isSuccess && "border-2 border-green-500 bg-transparent text-green-700",
          // Completed with penalty - yellow border
          isComplete && isPenalty && "border-2 border-yellow-500 bg-transparent text-yellow-700",
          // Not started
          !isCurrent && !isComplete && "bg-secondary text-secondary-foreground border-2 border-border",
        )}
      >
        {isComplete && isSuccess ? (
          // NEW: Display ratio instead of checkmark
          <div className="text-xs font-medium leading-tight">
            <span className="text-green-700">{position.attemptsUsed}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-green-600">{carryover}</span>
          </div>
        ) : isComplete && isPenalty ? (
          // Penalty mode display - show attempts used
          <div className="text-xs font-medium text-yellow-700">
            {position.attemptsUsed}
          </div>
        ) : (
          // Not complete: show position number
          <span className="text-lg">{position.positionNumber}</span>
        )}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center py-8 px-4">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-center gap-6">
          <div className="text-sm text-muted-foreground font-semibold">B</div>
        </div>
        
        <div className="flex justify-center gap-6">
          {renderPosition(positions[0])}
        </div>
        
        <div className="flex justify-center gap-20">
          {renderPosition(positions[1])}
          {renderPosition(positions[2])}
        </div>
        
        <div className="flex justify-center gap-40">
          {renderPosition(positions[3])}
          {renderPosition(positions[4])}
        </div>
        
        <div className="flex justify-center gap-60">
          {renderPosition(positions[5])}
          {renderPosition(positions[6])}
        </div>
        
        <div className="flex justify-center gap-80">
          {renderPosition(positions[7])}
          {renderPosition(positions[8])}
        </div>
      </div>
    </div>
  )
}
