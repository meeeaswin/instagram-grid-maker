import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridLayout, AspectRatio } from '@/utils/imageProcessor';

interface GridPreviewProps {
  gridImages: string[];
  layout: GridLayout;
  aspectRatio: AspectRatio;
  onDownloadAll: () => void;
}

export const GridPreview: React.FC<GridPreviewProps> = ({ 
  gridImages, 
  layout, 
  aspectRatio,
  onDownloadAll 
}) => {
  if (gridImages.length === 0) return null;

  const getGridClass = () => {
    return layout === '3x1' ? 'grid-cols-3 grid-rows-1' : 
           layout === '3x2' ? 'grid-cols-3 grid-rows-2' : 
           'grid-cols-3 grid-rows-3';
  };

  const getAspectClass = () => {
    return aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]';
  };

  const pieceCount = layout === '3x1' ? 3 : layout === '3x2' ? 6 : 9;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Your Instagram Grid</h2>
        <p className="text-muted-foreground">
          Post these images in order (1-{pieceCount}) to create the perfect {layout} grid layout
        </p>
      </div>
      
      <div className={cn("grid gap-4 p-6 bg-card rounded-2xl shadow-xl", getGridClass())}>
        {gridImages.map((imageUrl, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-xl overflow-hidden grid-item",
              "bg-muted border-2 border-border hover:border-primary/50",
              getAspectClass()
            )}
          >
            <img
              src={imageUrl}
              alt={`Grid piece ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-primary/30">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Button 
          variant="hero" 
          size="lg" 
          onClick={onDownloadAll}
          className="px-8 py-4 text-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Download All Images
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-xl p-6 text-center space-y-2">
        <h3 className="font-semibold text-foreground">Posting Instructions</h3>
        <p className="text-sm text-muted-foreground">
          Upload images to Instagram in numerical order (1, 2, 3... 9) to create your grid effect.
          Post them one by one or use a scheduling tool.
        </p>
      </div>
    </div>
  );
};