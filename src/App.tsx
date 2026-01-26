import { useEffect, useState, useCallback } from "react"
import { Session, Position, PuttResult } from "./lib/types"
import { 
  createNewSession, 
  calculateCarryover, 
  calculatePositionScore,
  calculateSessionScore,
  createSessionSummary,
} from "./lib/game-logic"
import { 
  saveCurrentSession, 
  loadCurrentSession, 
  clearCurrentSession,
  archiveSession,
  initDB,
} from "./lib/storage"
import { GameHeader } from "./components/GameHeader"
import { PositionTriangle } from "./components/PositionTriangle"
import { PuttStatus } from "./components/PuttStatus"
import { GameControls } from "./components/GameControls"
import { RestartDialog } from "./components/RestartDialog"
import { SessionComplete } from "./components/SessionComplete"
import { SessionHistory } from "./components/SessionHistory"
import { InstructionsDialog } from "./components/InstructionsDialog"
import { Toaster, toast } from "sonner"
import { motion } from "framer-motion"

type AppView = "game" | "complete" | "history"

const INSTRUCTIONS_SEEN_KEY = "instructions_seen"

function App() {
  const [session, setSession] = useState<Session>(createNewSession())
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [showManualRestartDialog, setShowManualRestartDialog] = useState(false)
  const [currentView, setCurrentView] = useState<AppView>("game")
  const [processingPutt, setProcessingPutt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    async function initialize() {
      await initDB()
      
      const hasSeeded = localStorage.getItem("history_seeded")
      if (!hasSeeded) {
        const { seedHistoryData } = await import("./lib/seed-data")
        await seedHistoryData()
        localStorage.setItem("history_seeded", "true")
      }
      
      const savedSession = loadCurrentSession()
      if (savedSession && !savedSession.endTime) {
        setSession(savedSession)
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

  const recordPutt = useCallback(async (result: PuttResult) => {
    if (processingPutt) return
    setProcessingPutt(true)

    const currentPos = getCurrentPosition()
    
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

    if (result === "sink") {
      toast.success("Sink!", { duration: 1000 })
    }

    setTimeout(() => {
      checkPositionComplete(updatedPosition, updatedPositions)
      setProcessingPutt(false)
    }, 200)
  }, [session, getCurrentPosition, processingPutt])

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
  }, [session.penaltyMode])

  const completePosition = useCallback((
    position: Position,
    allPositions: Position[],
    status: "success" | "continued-penalty"
  ) => {
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

    const updatedPositions = [...allPositions]
    updatedPositions[session.currentPositionNumber - 1] = completedPosition

    if (session.currentPositionNumber < 9) {
      const carryover = calculateCarryover(completedPosition)
      const nextPositionIndex = completedPosition.positionNumber  // Use completed position's number instead of session.currentPositionNumber
      const nextPosition = updatedPositions[nextPositionIndex]
      
      updatedPositions[nextPositionIndex] = {
        ...nextPosition,
        attemptsCarriedOver: carryover,
        totalAttemptsAvailable: nextPosition.baseAttemptsAllocated + carryover,
      }

      setTimeout(() => {
        setSession(prev => ({
          ...prev,
          currentPositionNumber: prev.currentPositionNumber + 1,
          positions: updatedPositions,
        }))
        saveCurrentSession({
          ...session,
          currentPositionNumber: session.currentPositionNumber + 1,
          positions: updatedPositions,
        })
      }, 500)
    } else {
      finishSession(updatedPositions)
    }
  }, [session])

  const finishSession = useCallback(async (positions: Position[]) => {
    const endTime = Date.now()
    const finalSession: Session = {
      ...session,
      positions,
      endTime,
    }
    
    finalSession.finalScore = calculateSessionScore(finalSession)
    finalSession.sessionSummary = createSessionSummary(finalSession)

    setSession(finalSession)
    await archiveSession(finalSession)
    clearCurrentSession()
    setCurrentView("complete")
  }, [session])

  const handleContinueWithPenalty = useCallback(() => {
    setShowRestartDialog(false)
    
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
    toast.info("Game restarted", { duration: 1500 })
  }, [])

  const handleNewGame = useCallback(() => {
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
    setCurrentView("game")
  }, [])

  const handleViewHistory = useCallback(() => {
    setCurrentView("history")
  }, [])

  const handleBackToGame = useCallback(() => {
    setCurrentView("game")
  }, [])

  const handleManualRestart = useCallback(() => {
    setShowManualRestartDialog(true)
  }, [])

  const handleConfirmManualRestart = useCallback(() => {
    setShowManualRestartDialog(false)
    const newSession = createNewSession()
    setSession(newSession)
    saveCurrentSession(newSession)
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

  if (currentView === "history") {
    return (
      <>
        <SessionHistory onBack={handleBackToGame} />
        <Toaster position="top-center" />
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
        />

        <div className="flex-1 overflow-auto">
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

          <PuttStatus
            position={currentPosition}
            penaltyMode={session.penaltyMode}
          />
        </div>

        <GameControls
          onRecordSink={() => recordPutt("sink")}
          onRecordMiss={() => recordPutt("miss")}
          disabled={processingPutt}
        />
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

      <Toaster position="top-center" />
    </>
  )
}

export default App