import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from '@phosphor-icons/react';

interface PositionExplainerProps {
  putts: number;
  carryover: number;
}

export function PositionExplainer({ putts, carryover }: PositionExplainerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="flex items-center gap-1 border-2 border-green-500 rounded-full px-3 py-2 hover:bg-green-50 transition-colors"
          aria-label={`Position completed in ${putts} ${putts === 1 ? 'putt' : 'putts'} with ${carryover} ${carryover === 1 ? 'shot' : 'shots'} remaining. Click for details.`}
        >
          <span className="text-sm font-bold text-green-600">{putts}/{carryover}</span>
          <Info size={14} className="text-green-600" weight="fill" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Position Completion</p>
          <div className="space-y-2">
            <p className="text-sm">
              You completed this position in <strong className="text-green-600">{putts} {putts === 1 ? 'putt' : 'putts'}</strong>.
            </p>
            {carryover > 0 ? (
              <p className="text-sm">
                You had <strong className="text-green-600">{carryover} {carryover === 1 ? 'shot' : 'shots'} remaining</strong> that carried to the next position.
              </p>
            ) : (
              <p className="text-sm">
                You used all available attempts <strong>(no carryover to next position)</strong>.
              </p>
            )}
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Tip: Completing positions quickly allows you to carry unused attempts forward!
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
