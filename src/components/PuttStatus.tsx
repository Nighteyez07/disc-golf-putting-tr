import { Position } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface PuttStatusProps {
  position: Position
  penaltyMode: boolean
}

export function PuttStatus({ position, penaltyMode }: PuttStatusProps) {
  // Add null-safety check to prevent error when position is undefined during state transitions
  if (!position) {
    return null
  }

  const remaining = position.totalAttemptsAvailable - position.attemptsUsed
  const isOverage = position.attemptsUsed > position.totalAttemptsAvailable
  
  const renderPuttIndicators = () => {
    const indicators: React.ReactNode[] = []
    for (let i = 0; i < 3; i++) {
      const isFilled = i < position.puttsInSunk
      indicators.push(
        <motion.div
          key={i}
          initial={isFilled ? { scale: 0 } : false}
          animate={isFilled ? { scale: [0, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all duration-300",
            isFilled 
              ? "bg-accent border-accent" 
              : "border-muted-foreground/30"
          )}
        />
      )
    }
    return indicators
  }

  return (
    <div className="bg-card px-5 py-6 border-b border-border">
      <div className="flex items-center justify-center gap-3 mb-4">
        {renderPuttIndicators()}
      </div>
      
      <div className="text-center">
        <div className="text-xl font-semibold mb-1">
          {position.puttsInSunk}/3 sunk
        </div>
        <div className={cn(
          "text-base",
          isOverage && penaltyMode ? "text-warning font-semibold" : "text-muted-foreground"
        )}>
          {isOverage && penaltyMode ? (
            <>
              {Math.abs(remaining)} penalty {Math.abs(remaining) === 1 ? "putt" : "putts"}
            </>
          ) : (
            <>
              {remaining} {remaining === 1 ? "shot" : "shots"} remaining
            </>
          )}
        </div>
      </div>
    </div>
  )
}
