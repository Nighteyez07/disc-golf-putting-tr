import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { formatScore, formatDuration } from "@/lib/game-logic"
import { Trophy, Plus } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { getSessionHistory } from "@/lib/storage"
import { Session } from "@/lib/types"

interface SessionHistoryProps {
  onNewRound: () => void
}

export function SessionHistory({ onNewRound }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setLoading(true)
    const history = await getSessionHistory()
    setSessions(history)
    setLoading(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b-2 border-border px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Training History</h1>
        </div>
        <Button
          onClick={onNewRound}
          className="w-full h-12 text-base font-semibold"
        >
          <Plus className="mr-2" size={24} weight="bold" />
          Start New Round
        </Button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            Loading history...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Sessions Yet</h2>
            <p className="text-muted-foreground mb-4">
              Complete your first round to see your history here.
            </p>
            <Button onClick={onNewRound} className="mt-2">
              <Plus className="mr-2" size={20} />
              Start Your First Round
            </Button>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <Accordion type="single" collapsible className="space-y-3 pb-4">
              {sessions.map((session) => (
                <AccordionItem 
                  key={session.sessionId} 
                  value={session.sessionId}
                  className="border rounded-lg bg-card"
                >
                  <Card className="border-0">
                    <AccordionTrigger className="px-4 py-4 hover:no-underline">
                      <div className="flex items-start justify-between w-full pr-2">
                        <div className="flex-1 text-left">
                          <div className="text-sm text-muted-foreground mb-1">
                            {formatDate(session.startTime)}
                          </div>
                          <div className="numeric text-3xl font-bold text-primary">
                            {formatScore(session.finalScore)}
                          </div>
                        </div>
                        {session.sessionSummary && (
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{formatDuration(session.sessionSummary.duration)}</div>
                            <div className="mt-1">
                              {session.sessionSummary.successfulPositions}/9 success
                            </div>
                            {session.sessionSummary.penaltyPositions.length > 0 && (
                              <div className="text-warning font-semibold">
                                {session.sessionSummary.penaltyPositions.length} penalties
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4">
                      {/* Position Scores Grid */}
                      {session.positionScores && (
                        <div className="mb-4">
                          <div className="text-sm font-semibold mb-2">Position Scores</div>
                          <div className="grid grid-cols-9 gap-1">
                            {session.positionScores.map((score: number, i: number) => (
                              <div 
                                key={i}
                                className="text-center text-xs p-1 rounded bg-secondary"
                              >
                                <div className="text-[10px] text-muted-foreground mb-0.5">
                                  {i + 1}
                                </div>
                                <div className={`numeric font-bold ${
                                  score < 0 ? 'text-warning' : 'text-foreground'
                                }`}>
                                  {score > 0 ? `+${score}` : score}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Position Breakdown */}
                      {session.positions && (
                        <div>
                          <div className="text-sm font-semibold mb-2">Detailed Breakdown</div>
                          <div className="space-y-2">
                            {session.positions.map((pos) => {
                              const accuracy = pos.puttsInSunk > 0 && pos.attemptsUsed > 0
                                ? Math.round((pos.puttsInSunk / pos.attemptsUsed) * 100)
                                : 0
                              const isPenalty = pos.status === "continued-penalty"
                              
                              return (
                                <div 
                                  key={pos.positionNumber}
                                  className={`p-3 rounded-lg ${
                                    isPenalty ? 'bg-warning/10 border border-warning/20' : 'bg-secondary'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold">
                                        Position {pos.positionNumber}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        <span className="numeric">{pos.puttsInSunk}/3</span> made
                                        {" • "}
                                        <span className="numeric">{pos.attemptsUsed}/{pos.totalAttemptsAvailable}</span> attempts
                                        {pos.attemptsCarriedOver > 0 && (
                                          <>
                                            {" • "}
                                            <span className="text-primary">+{pos.attemptsCarriedOver} carry</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`numeric text-lg font-bold ${
                                        isPenalty ? 'text-warning' : 'text-foreground'
                                      }`}>
                                        {pos.positionScore > 0 ? `+${pos.positionScore}` : pos.positionScore}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {accuracy}% acc
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
