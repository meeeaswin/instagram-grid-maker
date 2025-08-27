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
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-primary/20 rounded-2xl">
              <Scissors className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Instagram Grid Maker
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any image into a stunning 3x3 Instagram grid. Upload, resize, and download with professional quality.
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
          <div className="text-center">
            <button
              onClick={() => setGridImages([])}
              className="text-muted-foreground hover:text-foreground transition-colors underline"
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
