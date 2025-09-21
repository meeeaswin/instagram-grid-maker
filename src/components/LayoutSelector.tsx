import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type GridLayout = '3x1' | '3x2' | '3x3';
export type AspectRatio = 'square' | 'portrait';

interface LayoutSelectorProps {
  selectedLayout: GridLayout;
  selectedRatio: AspectRatio;
  onLayoutChange: (layout: GridLayout) => void;
  onRatioChange: (ratio: AspectRatio) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  selectedRatio,
  onLayoutChange,
  onRatioChange,
}) => {
  const layouts: { value: GridLayout; label: string; description: string }[] = [
    { value: '3x1', label: '3×1', description: '3 pieces horizontal' },
    { value: '3x2', label: '3×2', description: '6 pieces grid' },
    { value: '3x3', label: '3×3', description: '9 pieces grid' },
  ];

  const ratios: { value: AspectRatio; label: string; description: string }[] = [
    { value: 'square', label: 'Square', description: '1:1 ratio (1080×1080)' },
    { value: 'portrait', label: 'Portrait', description: '4:5 ratio (1080×1350)' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Grid Layout</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {layouts.map((layout) => (
            <Button
              key={layout.value}
              variant={selectedLayout === layout.value ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center p-3 sm:p-4 h-auto space-y-1 sm:space-y-2 touch-manipulation active:scale-95",
                selectedLayout === layout.value && "ring-2 ring-primary/20"
              )}
              onClick={() => onLayoutChange(layout.value)}
            >
              <span className="text-base sm:text-lg font-bold">{layout.label}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{layout.description}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Aspect Ratio</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {ratios.map((ratio) => (
            <Button
              key={ratio.value}
              variant={selectedRatio === ratio.value ? "default" : "outline"}
              className={cn(
                "flex flex-col items-center p-3 sm:p-4 h-auto space-y-1 sm:space-y-2 touch-manipulation active:scale-95",
                selectedRatio === ratio.value && "ring-2 ring-primary/20"
              )}
              onClick={() => onRatioChange(ratio.value)}
            >
              <span className="text-sm sm:text-base font-semibold">{ratio.label}</span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{ratio.description}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};