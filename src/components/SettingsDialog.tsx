import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getHapticPreference, setHapticPreference, isHapticsSupported } from "@/lib/haptics"
import { Vibrate } from "@phosphor-icons/react"

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [hapticsEnabled, setHapticsEnabled] = useState(getHapticPreference())
  const hapticsSupported = isHapticsSupported()

  useEffect(() => {
    // Load preference when dialog opens
    if (open) {
      setHapticsEnabled(getHapticPreference())
    }
  }, [open])

  const handleHapticsToggle = (checked: boolean) => {
    setHapticsEnabled(checked)
    setHapticPreference(checked)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Vibrate size={28} weight="duotone" className="text-primary" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your app preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="haptics-toggle" className="text-base">
                  Haptic Feedback
                </Label>
                <div className="text-sm text-muted-foreground">
                  {hapticsSupported ? (
                    "Vibrate on button presses (mobile devices)"
                  ) : (
                    "Not supported on this device"
                  )}
                </div>
              </div>
              <Switch
                id="haptics-toggle"
                checked={hapticsEnabled}
                onCheckedChange={handleHapticsToggle}
                disabled={!hapticsSupported}
              />
            </div>

            {!hapticsSupported && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Note:</strong> Haptic feedback requires a mobile device with 
                vibration support and HTTPS. Some browsers like iOS Safari may have 
                limited or no support for the Vibration API.
              </div>
            )}

            {hapticsSupported && (
              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
                <div className="space-y-1">
                  <p><strong>Vibration patterns:</strong></p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li><strong>Sink:</strong> Short pulse (50ms)</li>
                    <li><strong>Miss:</strong> Two short pulses (30ms each)</li>
                    <li><strong>Penalty:</strong> Long pattern (200ms-100ms-200ms)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
