import { useEffect, useRef } from "react"
import { Position } from "@/lib/types"
import { cn } from "@/lib/utils"
import { calculateCarryover } from "@/lib/game-logic"
import { PositionExplainer } from "./PositionExplainer"

// Delay to allow React state updates and DOM rendering to complete before scrolling
const SCROLL_DELAY_MS = 50

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
  const positionRefs = useRef<(HTMLDivElement | null)[]>(Array(positions.length).fill(null))
  
  // Auto-scroll to current position
  useEffect(() => {
    const currentIndex = currentPosition - 1
    const currentRef = positionRefs.current[currentIndex]
    
    if (currentRef) {
      // Small delay to allow DOM updates to settle
      setTimeout(() => {
        currentRef.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'nearest'
        })
      }, SCROLL_DELAY_MS)
    }
  }, [currentPosition])
  const renderPosition = (position: Position) => {
    const isCurrent = position.positionNumber === currentPosition
    const isComplete = position.completed
    const isSuccess = position.status === "success"
    const isPenalty = position.status === "continued-penalty"
    
    // Calculate carryover for completed positions
    const carryover = isComplete ? calculateCarryover(position) : 0
    
    // For completed success positions, render the PositionExplainer directly
    if (isComplete && isSuccess) {
      return (
        <div 
          key={position.positionNumber} 
          ref={el => positionRefs.current[position.positionNumber - 1] = el}
          className="w-14 h-14 flex items-center justify-center"
        >
          <PositionExplainer 
            putts={position.attemptsUsed} 
            carryover={carryover} 
          />
        </div>
      )
    }
    
    // For all other states, render a button
    return (
      <button
        key={position.positionNumber}
        ref={el => positionRefs.current[position.positionNumber - 1] = el}
        onClick={() => onSelectPosition?.(position.positionNumber)}
        disabled={position.positionNumber !== currentPosition}
        className={cn(
          "w-14 h-14 rounded-full font-bold transition-all duration-200",
          "flex items-center justify-center relative",
          "disabled:cursor-default",
          // Current position (in progress)
          isCurrent && !isComplete && "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/30",
          // Completed with penalty - yellow border
          isComplete && isPenalty && "border-2 border-yellow-500 bg-transparent text-yellow-700",
          // Not started
          !isCurrent && !isComplete && "bg-secondary text-secondary-foreground border-2 border-border",
        )}
      >
        {isComplete && isPenalty ? (
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
        
        {/* Row 2: Responsive gaps - smaller on mobile, full size on larger screens */}
        <div className="flex justify-center gap-8 sm:gap-20">
          {renderPosition(positions[1])}
          {renderPosition(positions[2])}
        </div>
        
        {/* Row 3: Responsive gaps */}
        <div className="flex justify-center gap-16 sm:gap-40">
          {renderPosition(positions[3])}
          {renderPosition(positions[4])}
        </div>
        
        {/* Row 4: Responsive gaps */}
        <div className="flex justify-center gap-24 sm:gap-60">
          {renderPosition(positions[5])}
          {renderPosition(positions[6])}
        </div>
        
        {/* Row 5: Responsive gaps */}
        <div className="flex justify-center gap-32 sm:gap-80">
          {renderPosition(positions[7])}
          {renderPosition(positions[8])}
        </div>
      </div>
    </div>
  )
}
