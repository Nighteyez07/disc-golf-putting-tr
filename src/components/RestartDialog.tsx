import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RestartDialogProps {
  open: boolean
  onRestart: () => void
  onContinue: () => void
  title?: string
  description?: string
  restartText?: string
  continueText?: string
}

export function RestartDialog({ 
  open, 
  onRestart, 
  onContinue,
  title = "Position Failed",
  description,
  restartText = "Restart Game",
  continueText = "Continue with Penalty"
}: RestartDialogProps) {
  const defaultDescription = (
    <>
      You've used all attempts without sinking 3 putts. 
      <br /><br />
      <strong>Restart</strong> to begin a new game from position 1, or <strong>Continue</strong> to keep playing with penalty scoring (−1 per extra putt).
    </>
  )

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={onContinue}
            className="h-12 text-base font-semibold"
          >
            {continueText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onRestart}
            className="h-12 text-base font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {restartText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
