import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatScore, formatDuration } from "@/lib/game-logic"
import { ArrowLeft, Trophy } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { getSessionHistory } from "@/lib/storage"

interface SessionHistoryProps {
  onBack: () => void
}

export function SessionHistory({ onBack }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<any[]>([])
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
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Session History</h1>
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
            <p className="text-muted-foreground">
              Complete your first game to see your history here.
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="space-y-3 pb-4">
              {sessions.map((session) => (
                <Card key={session.sessionId} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
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

                  {session.positionScores && (
                    <div className="grid grid-cols-9 gap-1 mt-3">
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
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
