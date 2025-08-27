import Pica from 'pica';
import JSZip from 'jszip';

const pica = new Pica();

export type GridLayout = '3x1' | '3x2' | '3x3';
export type AspectRatio = 'square' | 'portrait';

// Calculate dimensions based on layout and aspect ratio
const getDimensions = (layout: GridLayout, aspectRatio: AspectRatio) => {
  const pieceWidth = 1080;
  const pieceHeight = aspectRatio === 'square' ? 1080 : 1350;
  
  const cols = 3;
  const rows = layout === '3x1' ? 1 : layout === '3x2' ? 2 : 3;
  
  return {
    width: cols * pieceWidth,
    height: rows * pieceHeight,
    pieceWidth,
    pieceHeight,
    cols,
    rows
  };
};

export const resizeImage = async (
  file: File, 
  layout: GridLayout = '3x3', 
  aspectRatio: AspectRatio = 'square'
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        // Create canvas for original image
        const originalCanvas = document.createElement('canvas');
        const originalCtx = originalCanvas.getContext('2d');
        if (!originalCtx) throw new Error('Could not get canvas context');
        
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);
        
        // Get target dimensions
        const { width, height } = getDimensions(layout, aspectRatio);
        
        // Create canvas for resized image
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = width;
        resizedCanvas.height = height;
        
        // Use Pica for high-quality resizing
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

export const splitImageToGrid = (
  canvas: HTMLCanvasElement, 
  layout: GridLayout = '3x3',
  aspectRatio: AspectRatio = 'square'
): string[] => {
  const gridImages: string[] = [];
  const { pieceWidth, pieceHeight, cols, rows } = getDimensions(layout, aspectRatio);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Create canvas for each piece
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceWidth;
      pieceCanvas.height = pieceHeight;
      
      const ctx = pieceCanvas.getContext('2d');
      if (!ctx) continue;
      
      // Extract the piece from the main canvas
      ctx.drawImage(
        canvas,
        col * pieceWidth, // source x
        row * pieceHeight, // source y
        pieceWidth, // source width
        pieceHeight, // source height
        0, // destination x
        0, // destination y
        pieceWidth, // destination width
        pieceHeight  // destination height
      );
      
      // Convert to data URL
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