import React, { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { GridPreview } from '@/components/GridPreview';
import { LayoutSelector } from '@/components/LayoutSelector';
import { resizeImage, splitImageToGrid, downloadAllAsZip, GridLayout, AspectRatio } from '@/utils/imageProcessor';
import { useToast } from '@/hooks/use-toast';
import { Scissors } from 'lucide-react';

const Index = () => {
  const [gridImages, setGridImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<GridLayout>('3x3');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('square');
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Resize image using Pica with selected layout and aspect ratio
      const resizedCanvas = await resizeImage(file, selectedLayout, selectedRatio);
      
      // Split into grid based on selected layout and aspect ratio
      const pieces = splitImageToGrid(resizedCanvas, selectedLayout, selectedRatio);
      setGridImages(pieces);
      
      const pieceCount = selectedLayout === '3x1' ? 3 : selectedLayout === '3x2' ? 6 : 9;
      toast({
        title: "Success!",
        description: `Your image has been processed and split into ${pieceCount} pieces.`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    try {
      await downloadAllAsZip(gridImages);
      toast({
        title: "Downloaded!",
        description: "All images have been downloaded as a zip file.",
      });
    } catch (error) {
      console.error('Error downloading images:', error);
      toast({
        title: "Error", 
        description: "Failed to download images. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="p-2 sm:p-3 bg-primary/20 rounded-2xl">
              <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
              Instagram Grid Maker
            </h1>
          </div>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Transform any image into a stunning Instagram grid. Upload, resize, and download with professional quality.
          </p>
        </div>

        {/* Layout Selection */}
        {gridImages.length === 0 && (
          <LayoutSelector
            selectedLayout={selectedLayout}
            selectedRatio={selectedRatio}
            onLayoutChange={setSelectedLayout}
            onRatioChange={setSelectedRatio}
          />
        )}

        {/* Upload Section */}
        {gridImages.length === 0 && (
          <ImageUpload 
            onImageUpload={handleImageUpload} 
            isProcessing={isProcessing}
            layout={selectedLayout}
            aspectRatio={selectedRatio}
          />
        )}

        {/* Preview Section */}
        {gridImages.length > 0 && (
          <GridPreview 
            gridImages={gridImages} 
            layout={selectedLayout}
            aspectRatio={selectedRatio}
            onDownloadAll={handleDownloadAll} 
          />
        )}

        {/* Reset Button */}
        {gridImages.length > 0 && (
          <div className="text-center px-4">
            <button
              onClick={() => setGridImages([])}
              className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors underline touch-manipulation active:scale-95 py-2"
            >
              Start over with a new image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
