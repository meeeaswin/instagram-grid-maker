import Pica from 'pica';
import JSZip from 'jszip';

const pica = new Pica();

export const resizeImage = async (file: File): Promise<HTMLCanvasElement> => {
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
        
        // Create canvas for resized image (3240x3240)
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = 3240;
        resizedCanvas.height = 3240;
        
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

export const splitImageToGrid = (canvas: HTMLCanvasElement): string[] => {
  const gridImages: string[] = [];
  const pieceSize = 1080; // Each piece is 1080x1080 (3240/3 = 1080)
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // Create canvas for each piece
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceSize;
      pieceCanvas.height = pieceSize;
      
      const ctx = pieceCanvas.getContext('2d');
      if (!ctx) continue;
      
      // Extract the piece from the main canvas
      ctx.drawImage(
        canvas,
        col * pieceSize, // source x
        row * pieceSize, // source y
        pieceSize, // source width
        pieceSize, // source height
        0, // destination x
        0, // destination y
        pieceSize, // destination width
        pieceSize  // destination height
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