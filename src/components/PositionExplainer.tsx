import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PositionExplainerProps {
  putts: number;
  carryover: number;
}

export function PositionExplainer({ putts, carryover }: PositionExplainerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="w-14 h-14 rounded-full font-bold transition-all duration-200 flex items-center justify-center relative border-2 border-green-500 bg-transparent text-green-700 hover:bg-green-50 cursor-pointer"
          aria-label={`Position completed in ${putts} ${putts === 1 ? 'putt' : 'putts'} with ${carryover} ${carryover === 1 ? 'shot' : 'shots'} remaining. Click for details.`}
        >
          <div className="text-xs font-medium leading-tight">
            <span className="text-green-700">{putts}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-green-600">{carryover}</span>
          </div>
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
