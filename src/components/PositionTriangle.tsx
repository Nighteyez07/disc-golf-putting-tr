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
  const getPositionStyle = (positionNumber: number) => {
    const rows = [
      [1],
      [2, 3],
      [4, 5],
      [6, 7],
      [8, 9],
    ]
    
    let row = 0
    let col = 0
    
    for (let r = 0; r < rows.length; r++) {
      const idx = rows[r].indexOf(positionNumber)
      if (idx !== -1) {
        row = r
        col = idx
        break
      }
    }
    
    return { row, col, rowSize: rows[row].length }
  }

  const renderPosition = (position: Position) => {
    const { row, col, rowSize } = getPositionStyle(position.positionNumber)
    const isCurrent = position.positionNumber === currentPosition
    const isComplete = position.completed
    const isSuccess = position.status === "success"
    const isPenalty = position.status === "continued-penalty"
    const isBasket = position.positionNumber === 1
    
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
        style={{
          gridRow: row + 1,
          gridColumn: col + 1,
        }}
      >
        {isComplete && isSuccess && (
          <CheckCircle className="absolute inset-0 w-full h-full p-2" weight="fill" />
        )}
        {(!isComplete || !isSuccess) && (isBasket ? "B" : position.positionNumber)}
      </button>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div 
        className="grid gap-6 place-items-center"
        style={{
          gridTemplateColumns: "repeat(2, 56px)",
          gridTemplateRows: "repeat(5, 56px)",
        }}
      >
        {positions.map((pos) => renderPosition(pos))}
      </div>
    </div>
  )
}
