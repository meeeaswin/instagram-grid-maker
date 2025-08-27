import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { GridLayout, AspectRatio } from '@/utils/imageProcessor';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
  layout: GridLayout;
  aspectRatio: AspectRatio;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUpload, 
  isProcessing, 
  layout, 
  aspectRatio 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      onImageUpload(files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onImageUpload(files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 p-12",
          "hover:border-primary/50 hover:bg-card/50",
          isDragOver ? "border-primary bg-primary/5 scale-105" : "border-border",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className={cn(
            "p-6 rounded-full transition-all duration-300",
            isDragOver ? "bg-primary/20 scale-110" : "bg-muted/50"
          )}>
            {isDragOver ? (
              <ImageIcon className="w-12 h-12 text-primary" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              {isDragOver ? 'Drop your image here' : 'Upload an Image'}
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Drag & drop your image or click to browse. We'll resize and split it into a {layout} {aspectRatio} grid for Instagram.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Supports:</span>
            <span className="font-medium">JPG, PNG, WEBP</span>
          </div>
        </div>
        
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-foreground font-medium">Processing your image...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};