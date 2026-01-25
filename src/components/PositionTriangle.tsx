import { Position } from "@/lib/types"
import { cn } from "@/lib/utils"
import { CheckCircle } from "@phosphor-icons/react"

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
    
    return (
      <button
        key={position.positionNumber}
        onClick={() => onSelectPosition?.(position.positionNumber)}
        disabled={position.positionNumber !== currentPosition}
        className={cn(
          "w-14 h-14 rounded-full font-bold text-lg transition-all duration-200",
          "flex items-center justify-center relative",
          "disabled:cursor-default",
          isCurrent && !isComplete && "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/30",
          isComplete && isSuccess && "bg-accent text-accent-foreground",
          isComplete && isPenalty && "bg-warning text-warning-foreground",
          !isCurrent && !isComplete && "bg-secondary text-secondary-foreground border-2 border-border",
        )}
      >
        {isComplete && isSuccess && (
          <CheckCircle className="absolute inset-0 w-full h-full p-2" weight="fill" />
        )}
        {(!isComplete || !isSuccess) && position.positionNumber}
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
        
        <div className="flex justify-center gap-12">
          {renderPosition(positions[1])}
          {renderPosition(positions[2])}
        </div>
        
        <div className="flex justify-center gap-20">
          {renderPosition(positions[3])}
          {renderPosition(positions[4])}
        </div>
        
        <div className="flex justify-center gap-28">
          {renderPosition(positions[5])}
          {renderPosition(positions[6])}
        </div>
        
        <div className="flex justify-center gap-36">
          {renderPosition(positions[7])}
          {renderPosition(positions[8])}
        </div>
      </div>
    </div>
  )
}
