import { useEffect, useState, useCallback, useRef } from "react"
import { Session, Position, PuttResult, UndoHistoryEntry } from "./lib/types"
import { 
  createNewSession, 
  calculateCarryover, 
  calculatePositionScore,
  calculateSessionScore,
  createSessionSummary,
  createUndoSnapshot,
  canUndo,
  canRedo,
  calculateAccuracyRate,
} from "./lib/game-logic"
import { 
  saveCurrentSession, 
  clearCurrentSession,
  archiveSession,
  initDB,
} from "./lib/storage"
import { haptics } from "./lib/haptics"
import { GameHeader } from "./components/GameHeader"
import { PositionTriangle } from "./components/PositionTriangle"
import { PuttStatus } from "./components/PuttStatus"
import { GameControls } from "./components/GameControls"
import { RestartDialog } from "./components/RestartDialog"
import { SessionComplete } from "./components/SessionComplete"
import { SessionHistory } from "./components/SessionHistory"
import { InstructionsDialog } from "./components/InstructionsDialog"
import { SessionCompleteDialog } from "./components/SessionCompleteDialog"
import { SettingsDialog } from "./components/SettingsDialog"
import { Toaster, toast } from "sonner"
import { motion } from "framer-motion"

type AppView = "game" | "complete" | "history"

const INSTRUCTIONS_SEEN_KEY = "instructions_seen"
const MAX_POSITIONS = 9
const MAX_UNDO_HISTORY = 10

function App() {
  const [session, setSession] = useState<Session>(createNewSession())
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [showManualRestartDialog, setShowManualRestartDialog] = useState(false)
  const [currentView, setCurrentView] = useState<AppView>("history")
  const [processingPutt, setProcessingPutt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  
  // Undo/Redo state
  const [undoHistory, setUndoHistory] = useState<UndoHistoryEntry[]>([])
  const [redoHistory, setRedoHistory] = useState<UndoHistoryEntry[]>([])
  
  // Use a ref to track processing state immediately (synchronous check)
  // This prevents race conditions from rapid clicks before React re-renders
  const isProcessingRef = useRef(false)

  useEffect(() => {
    async function initialize() {
      await initDB()
      
      const hasSeeded = localStorage.getItem("history_seeded")
      if (!hasSeeded) {
        const { seedHistoryData } = await import("./lib/seed-data")
        await seedHistoryData()
        localStorage.setItem("history_seeded", "true")
      }
      
      const { loadCurrentSessionAsync } = await import("./lib/storage")
      const savedSession = await loadCurrentSessionAsync()
      if (savedSession && !savedSession.endTime) {
        setSession(savedSession)
        // If there's an active session, navigate to game view
        setCurrentView("game")
      } else {
        // Otherwise stay on history view (default)
        setCurrentView("history")
      }

      // Check if user has seen instructions before
      const hasSeenInstructions = localStorage.getItem(INSTRUCTIONS_SEEN_KEY)
      if (!hasSeenInstructions) {
        setShowInstructions(true)
      }
    }
    
    initialize()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (session.endTime === null) {
        saveCurrentSession(session)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [session])

  const getCurrentPosition = useCallback((): Position => {
    return session.positions[session.currentPositionNumber - 1]
  }, [session])

  const finishSession = useCallback(async () => {
    const endTime = Date.now()
    
    // Use the updater form to get the latest session state
    setSession(prev => {
      // Get positions from the latest state, not the parameter
      // This ensures we have all completed positions with their latest data
      let finalPositions = [...prev.positions];
      
      // Validate we have exactly 9 unique positions (1-9)
      const positionNumbers = new Set(finalPositions.map(p => p.positionNumber));
      if (positionNumbers.size !== 9 || finalPositions.length !== 9) {
        console.warn('Positions array corrupted, reconstructing...');
        // If corrupted, try to fix by ensuring we have positions 1-9
        const fixedPositions: Position[] = [];
        for (let i = 1; i <= 9; i++) {
          const existing = finalPositions.find(p => p.positionNumber === i);
          if (existing) {
            fixedPositions.push(existing);
          } else {
            console.error(`Missing position ${i}`);
          }
        }
        finalPositions = fixedPositions.length === 9 ? fixedPositions : prev.positions;
      }
      
      // Sort positions by positionNumber to ensure correct order  
      const sortedPositions = [...finalPositions].sort((a, b) => a.positionNumber - b.positionNumber);
      
      // Ensure all positions have proper completion status and scores
      const completedPositions = sortedPositions.map(pos => {
        const updatedPos = {
          ...pos,
          completed: true,
          // Ensure status is set if not already
          status: pos.status === "not-started" || pos.status === "in-progress" 
            ? "success" 
            : pos.status
        }
        
        // Recalculate position score to ensure it's correct
        if (updatedPos.puttsInSunk >= 3 && updatedPos.status === "success") {
          updatedPos.positionScore = 3
        } else if (updatedPos.status === "continued-penalty") {
          const overageAttempts = updatedPos.attemptsUsed - updatedPos.totalAttemptsAvailable
          updatedPos.positionScore = Math.max(0, overageAttempts) * -1
        }
        
        // Calculate accuracy rate for each position
        updatedPos.accuracyRate = calculateAccuracyRate(updatedPos)
        
        return updatedPos
      })
      
      const finalSession: Session = {
        ...prev,
        positions: completedPositions,
        endTime,
        currentPositionNumber: 9,
      }
      
      finalSession.finalScore = calculateSessionScore(finalSession)
      finalSession.sessionSummary = createSessionSummary(finalSession)
      
      // Archive and show popup asynchronously
      archiveSession(finalSession).then(() => {
        clearCurrentSession()
        setShowCompletionPopup(true)
      })
      
      return finalSession
    })
  }, [])

  const completePosition = useCallback((
    position: Position,
    allPositions: Position[],
    status: "success" | "continued-penalty"
  ) => {
    // Determine positionIndex from the position object itself, not from session state
    // This avoids stale closure issues
    const positionIndex = position.positionNumber - 1
    
    // Clear undo/redo history on position completion
    setUndoHistory([])
    setRedoHistory([])

    if (position.positionNumber < MAX_POSITIONS) {
      setTimeout(() => {
        setSession(prev => {
          // Use the current state to avoid stale closure issues
          const newPositions = [...prev.positions]
          
          // Get the current position data from state
          const currentPos = newPositions[positionIndex]
          
          // Mark current position as completed with updated data
          const completedPos: Position = {
            ...currentPos,
            status,
            completed: true,
          }
          
          const posScore = calculatePositionScore(
            completedPos,
            prev.penaltyMode || status === "continued-penalty"
          )
          
          completedPos.positionScore = posScore
          completedPos.accuracyRate = calculateAccuracyRate(completedPos)
          newPositions[positionIndex] = completedPos
          
          // Calculate carryover and add to next position
          // Note: calculateCarryover returns 0 for non-success status
          const carryover = calculateCarryover(completedPos)
          const nextPositionIndex = positionIndex + 1
          // Bounds check: ensure next position exists
          if (nextPositionIndex < newPositions.length) {
            newPositions[nextPositionIndex] = {
              ...newPositions[nextPositionIndex],
              attemptsCarriedOver: carryover,
              totalAttemptsAvailable: newPositions[nextPositionIndex].baseAttemptsAllocated + carryover,
            }
          }
          
          const newSession = {
            ...prev,
            currentPositionNumber: prev.currentPositionNumber + 1,
            positions: newPositions,
          }
          saveCurrentSession(newSession)
          return newSession
        })
      }, 500)
    } else {
      const completedPosition: Position = {
        ...position,
        status,
        completed: true,
      }
      
      const posScore = calculatePositionScore(
        completedPosition,
        session.penaltyMode || status === "continued-penalty"
      )
      
      completedPosition.positionScore = posScore
      completedPosition.accuracyRate = calculateAccuracyRate(completedPosition)
      
      const updatedPositions = [...allPositions]
      updatedPositions[positionIndex] = completedPosition
      finishSession(updatedPositions)
    }
  }, [session.penaltyMode, finishSession])

  const checkPositionComplete = useCallback((
    position: Position,
    allPositions: Position[]
  ) => {
    if (position.puttsInSunk >= 3) {
      completePosition(position, allPositions, "success")
      return
    }

    if (position.attemptsUsed >= position.totalAttemptsAvailable && !session.penaltyMode) {
      setShowRestartDialog(true)
    }
  }, [session.penaltyMode, completePosition])

  const recordPutt = useCallback(async (result: PuttResult) => {
    // Use ref for immediate synchronous check to prevent race conditions
    if (isProcessingRef.current) return
    
    // Set both ref (synchronous) and state (for UI)
    isProcessingRef.current = true
    setProcessingPutt(true)

    const currentPos = getCurrentPosition()
    
    // Save undo snapshot BEFORE making changes
    const undoSnapshot = createUndoSnapshot(
      session.currentPositionNumber - 1,
      currentPos,
      session.penaltyMode
    )
    
    const updatedPosition: Position = {
      ...currentPos,
      attemptsUsed: currentPos.attemptsUsed + 1,
      puttsInSunk: result === "sink" ? currentPos.puttsInSunk + 1 : currentPos.puttsInSunk,
      putts: [...currentPos.putts, { result, timestamp: Date.now() }],
      status: currentPos.status === "not-started" ? "in-progress" : currentPos.status,
    }

    const updatedPositions = [...session.positions]
    updatedPositions[session.currentPositionNumber - 1] = updatedPosition

    setSession(prev => ({
      ...prev,
      positions: updatedPositions,
    }))
    
    // Add to undo history (limit to MAX_UNDO_HISTORY entries)
    setUndoHistory(prev => [...prev, undoSnapshot].slice(-MAX_UNDO_HISTORY))
    // Clear redo history when new action is taken
    setRedoHistory([])

    if (result === "sink") {
      toast.success("Sink!", { duration: 1000 })
    }

    setTimeout(() => {
      checkPositionComplete(updatedPosition, updatedPositions)
      // Clear both ref and state
      isProcessingRef.current = false
      setProcessingPutt(false)
    }, 200)
  }, [session, getCurrentPosition, checkPositionComplete])

  const handleUndo = useCallback(() => {
    const currentPos = getCurrentPosition()
    
    if (!canUndo(undoHistory, currentPos)) {
      return
    }
    
    const lastEntry = undoHistory[undoHistory.length - 1]
    
    // Create current state snapshot for redo
    const redoSnapshot = createUndoSnapshot(
      session.currentPositionNumber - 1,
      currentPos,
      session.penaltyMode
    )
    
    // Restore previous state
    const updatedPositions = [...session.positions]
    updatedPositions[lastEntry.positionIndex] = lastEntry.position
    
    setSession(prev => ({
      ...prev,
      positions: updatedPositions,
      penaltyMode: lastEntry.penaltyMode,
    }))
    
    // Update undo/redo stacks
    setUndoHistory(prev => prev.slice(0, -1))
    setRedoHistory(prev => [...prev, redoSnapshot])
    
    // Show toast with putt result
    const lastPutt = currentPos.putts[currentPos.putts.length - 1]
    if (lastPutt) {
      toast.info(`Undid last ${lastPutt.result}`, { duration: 2000 })
    } else {
      toast.info("Undid last action", { duration: 2000 })
    }
  }, [session, getCurrentPosition, undoHistory])

  const handleRedo = useCallback(() => {
    if (!canRedo(redoHistory)) {
      return
    }
    
    const nextEntry = redoHistory[redoHistory.length - 1]
    
    // Create current state snapshot for undo
    const currentPos = getCurrentPosition()
    const undoSnapshot = createUndoSnapshot(
      session.currentPositionNumber - 1,
      currentPos,
      session.penaltyMode
    )
    
    // Restore redo state
    const updatedPositions = [...session.positions]
    updatedPositions[nextEntry.positionIndex] = nextEntry.position
    
    setSession(prev => ({
      ...prev,
      positions: updatedPositions,
      penaltyMode: nextEntry.penaltyMode,
    }))
    
    // Update undo/redo stacks
    setUndoHistory(prev => [...prev, undoSnapshot])
    setRedoHistory(prev => prev.slice(0, -1))
    
    // Show toast with putt result
    const lastPutt = nextEntry.position.putts[nextEntry.position.putts.length - 1]
    if (lastPutt) {
      toast.info(`Redid last ${lastPutt.result}`, { duration: 2000 })
    } else {
      toast.info("Redid last action", { duration: 2000 })
    }
  }, [session, getCurrentPosition, redoHistory])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if currently in game view and not processing
      if (currentView !== "game" || isProcessingRef.current) {
        return
      }
      
      // Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      }
      
      // Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac) for redo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault()
        handleRedo()
      }
      
      // Ctrl+Y (Windows/Linux alternative for redo)
      if (event.ctrlKey && event.key === 'y' && !event.shiftKey) {
        event.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, handleUndo, handleRedo])


  const handleContinueWithPenalty = useCallback(() => {
    setShowRestartDialog(false)
    
    // Trigger penalty haptic feedback
    haptics.penalty()
    
    const currentPos = getCurrentPosition()
    const updatedPosition: Position = {
      ...currentPos,
      status: "continued-penalty",
    }

    const updatedPositions = [...session.positions]
    updatedPositions[session.currentPositionNumber - 1] = updatedPosition

    setSession(prev => ({
      ...prev,
      penaltyMode: true,
      positions: updatedPositions,
    }))

    toast.warning("Penalty scoring activated", { duration: 2000 })
  }, [session, getCurrentPosition])

  const handleRestart = useCallback(() => {
    setShowRestartDialog(false)
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
    // Clear undo/redo history on restart
    setUndoHistory([])
    setRedoHistory([])
    toast.info("Game restarted", { duration: 1500 })
  }, [])

  const handleNewGame = useCallback(() => {
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
    setCurrentView("game")
    // Clear undo/redo history on new game
    setUndoHistory([])
    setRedoHistory([])
  }, [])

  const handleViewHistory = useCallback(() => {
    setCurrentView("history")
  }, [])

  const handleManualRestart = useCallback(() => {
    setShowManualRestartDialog(true)
  }, [])

  const handleConfirmManualRestart = useCallback(() => {
    setShowManualRestartDialog(false)
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
    // Clear undo/redo history on restart
    setUndoHistory([])
    setRedoHistory([])
    toast.info("Game restarted", { duration: 1500 })
  }, [])

  const handleCancelManualRestart = useCallback(() => {
    setShowManualRestartDialog(false)
  }, [])

  const handleShowInstructions = useCallback(() => {
    setShowInstructions(true)
  }, [])

  const handleCloseInstructions = useCallback(() => {
    localStorage.setItem(INSTRUCTIONS_SEEN_KEY, "true")
    setShowInstructions(false)
  }, [])

  const handleShowSettings = useCallback(() => {
    setShowSettings(true)
  }, [])

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
  }, [])

  const handleCloseCompletionPopup = useCallback(() => {
    setShowCompletionPopup(false)
    setCurrentView("history")
  }, [])

  const handleRestartFromCompletion = useCallback(() => {
    setShowCompletionPopup(false)
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
    setCurrentView("game")
    // Clear undo/redo history on restart
    setUndoHistory([])
    setRedoHistory([])
    toast.info("Game restarted", { duration: 1500 })
  }, [])

  if (currentView === "history") {
    return (
      <>
        <SessionHistory onNewRound={handleNewGame} />
        <Toaster position="top-center" />
        <InstructionsDialog
          open={showInstructions}
          onClose={handleCloseInstructions}
        />
      </>
    )
  }

  if (currentView === "complete") {
    return (
      <>
        <SessionComplete
          session={session}
          onNewGame={handleNewGame}
          onViewHistory={handleViewHistory}
        />
        <Toaster position="top-center" />
      </>
    )
  }

  const currentPosition = getCurrentPosition()
  const cumulativeScore = calculateSessionScore(session)

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <GameHeader
          currentPosition={session.currentPositionNumber}
          totalPositions={9}
          cumulativeScore={cumulativeScore}
          position={currentPosition}
          penaltyMode={session.penaltyMode}
          session={session}
          onRestart={handleManualRestart}
          onShowInstructions={handleShowInstructions}
          onShowSettings={handleShowSettings}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo(undoHistory, currentPosition)}
          canRedo={canRedo(redoHistory)}
        />

        {/* Scrollable pyramid area with bottom padding for sticky controls */}
        <div className="flex-1 overflow-auto pb-52">
          <motion.div
            key={session.currentPositionNumber}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PositionTriangle
              positions={session.positions}
              currentPosition={session.currentPositionNumber}
            />
          </motion.div>
        </div>

        {/* Sticky game controls - always at bottom */}
        <div className="sticky bottom-0 mt-auto bg-background border-t border-border shadow-lg z-10" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          <PuttStatus
            position={currentPosition}
            penaltyMode={session.penaltyMode}
          />
          <GameControls
            onRecordSink={() => recordPutt("sink")}
            onRecordMiss={() => recordPutt("miss")}
            disabled={processingPutt}
            sessionComplete={session.endTime !== null}
          />
        </div>
      </div>

      <RestartDialog
        open={showRestartDialog}
        onRestart={handleRestart}
        onContinue={handleContinueWithPenalty}
      />

      <RestartDialog
        open={showManualRestartDialog}
        onRestart={handleConfirmManualRestart}
        onContinue={handleCancelManualRestart}
        title="Restart Game?"
        description="Are you sure you want to restart? Your current progress will be lost."
        continueText="Cancel"
      />

      <InstructionsDialog
        open={showInstructions}
        onClose={handleCloseInstructions}
      />

      <SettingsDialog
        open={showSettings}
        onClose={handleCloseSettings}
      />

      <SessionCompleteDialog
        open={showCompletionPopup}
        session={session}
        onRestart={handleRestartFromCompletion}
        onClose={handleCloseCompletionPopup}
      />

      <Toaster position="top-center" />
    </>
  )
}

export default App