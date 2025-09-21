import Pica from 'pica';
import JSZip from 'jszip';

const pica = new Pica();

export type GridLayout = '3x1' | '3x2' | '3x3';
export type AspectRatio = 'square' | 'portrait';

// Calculate Instagram-ready dimensions based on layout and aspect ratio
const getDimensions = (layout: GridLayout, aspectRatio: AspectRatio) => {
  // Each Instagram piece: 1080x1080 (square) or 1080x1350 (portrait)
  const pieceWidth = 1080;
  const pieceHeight = aspectRatio === 'square' ? 1080 : 1350;
  
  const cols = 3;
  const rows = layout === '3x1' ? 1 : layout === '3x2' ? 2 : 3;
  
  // Final Instagram-ready dimensions:
  // 3x1 square: 3240x1080, 3x2 square: 3240x2160, 3x3 square: 3240x3240
  // 3x1 portrait: 3240x1350, 3x2 portrait: 3240x2700, 3x3 portrait: 3240x4050
  return {
    width: cols * pieceWidth,    // Total width (always 3240)
    height: rows * pieceHeight,  // Total height (varies by layout/ratio)
    pieceWidth,
    pieceHeight,
    cols,
    rows
  };
};

// Step 1: Resize uploaded image to Instagram-ready dimensions using Pica
export const resizeImage = async (
  file: File, 
  layout: GridLayout = '3x3', 
  aspectRatio: AspectRatio = 'square'
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Create canvas for original uploaded image
        const originalCanvas = document.createElement('canvas');
        const originalCtx = originalCanvas.getContext('2d');
        if (!originalCtx) throw new Error('Could not get canvas context');
        
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);
        
        // Get target Instagram-ready dimensions
        const { width, height } = getDimensions(layout, aspectRatio);
        
        // Create canvas for Instagram-ready resized image
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = width;  // e.g., 3240 for 3-column grid
        resizedCanvas.height = height; // e.g., 3240 for 3x3 square
        
        // Use Pica for high-quality resizing to exact Instagram dimensions
        await pica.resize(originalCanvas, resizedCanvas);
        resolve(resizedCanvas);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

// Step 2: Slice the resized image into equal Instagram-ready pieces
export const splitImageToGrid = (
  canvas: HTMLCanvasElement, 
  layout: GridLayout = '3x3',
  aspectRatio: AspectRatio = 'square'
): string[] => {
  const gridImages: string[] = [];
  const { pieceWidth, pieceHeight, cols, rows } = getDimensions(layout, aspectRatio);
  
  // Slice in posting order (left to right, top to bottom)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Create canvas for each Instagram piece (1080x1080 or 1080x1350)
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceWidth;   // 1080
      pieceCanvas.height = pieceHeight; // 1080 (square) or 1350 (portrait)
      
      const ctx = pieceCanvas.getContext('2d');
      if (!ctx) continue;
      
      // Extract the exact piece from the resized canvas
      ctx.drawImage(
        canvas,
        col * pieceWidth,  // source x position
        row * pieceHeight, // source y position
        pieceWidth,        // source width (1080)
        pieceHeight,       // source height (1080 or 1350)
        0,                 // destination x
        0,                 // destination y
        pieceWidth,        // destination width
        pieceHeight        // destination height
      );
      
      // Convert to high-quality JPEG
      gridImages.push(pieceCanvas.toDataURL('image/jpeg', 0.9));
    }
  }
  
  return gridImages;
};

export const downloadAllAsZip = async (gridImages: string[]): Promise<void> => {
  const zip = new JSZip();
  
  // Add each image to zip
  for (let i = 0; i < gridImages.length; i++) {
    // Convert data URL to blob
    const response = await fetch(gridImages[i]);
    const blob = await response.blob();
    
    // Add to zip with numbered filename
    zip.file(`${i + 1}.jpg`, blob);
  }
  
  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'instagram-grid.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};