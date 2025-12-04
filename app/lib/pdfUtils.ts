import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Get base URL for assets (handles GitHub Pages deployment)
const baseUrl = import.meta.env.BASE_URL || '/';

/**
 * Preloads an image and returns it as a data URL
 * @param url - URL of the image to load
 * @returns Promise resolving to the image data URL
 */
const preloadImage = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";  // Handle CORS issues
    img.onload = () => {
      // Create canvas to convert to data URL
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
    img.src = url;
  });
};

/**
 * Generates a PDF from a recipe card element and downloads it
 * @param recipeCardElement - The DOM element of the recipe card to convert to PDF
 * @param recipeName - The name of the recipe for the PDF filename
 */
export const generateRecipePDF = async (
  recipeCardElement: HTMLElement,
  recipeName: string
): Promise<void> => {
  // Find elements to hide
  const imageGenButton = recipeCardElement.querySelector('#generate-image-button') as HTMLElement | null;
  const actionButtons = recipeCardElement.querySelector('#action-buttons-container') as HTMLElement | null;
  
  // Store original styles
  const originalImageBtnStyle = imageGenButton?.style.display;
  const originalActionBtnsStyle = actionButtons?.style.display;

  try {
    // Hide elements before capture
    if (imageGenButton) imageGenButton.style.display = 'none';
    if (actionButtons) actionButtons.style.display = 'none';

    // Add a small delay to ensure styles are applied before capture
    await new Promise(resolve => setTimeout(resolve, 50)); 

    // Load logo image in advance - we'll use the favicon to avoid distortion
    let logoDataUrl: string;
    try {
      // Use the favicon which has better proportions for the header
      logoDataUrl = await preloadImage(`${baseUrl}icons/icon-48x48.png`);
    } catch (logoError) {
      console.warn('Could not load logo for PDF, using text-only header', logoError);
      logoDataUrl = ''; // Empty if logo loading fails
    }

    // Create a canvas from the recipe card element
    const canvas = await html2canvas(recipeCardElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      backgroundColor: '#ffffff', // White background
    });

    // Calculate dimensions for A4 page (210mm x 297mm)
    // Define constants
    const pdfWidth = 210; // A4 width in mm
    const margin = 15; // Increased margin
    const contentWidth = pdfWidth - 2 * margin;
    
    // Set heights based on whether we have a logo
    const headerHeight = logoDataUrl ? 25 : 15; // More space for header with logo
    const footerHeight = 15; // Estimated space for footer line + text + bottom margin
    
    // Calculate proportional image dimensions based on contentWidth
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate required page height
    const pageHeight = headerHeight + imgHeight + footerHeight; 
    
    // Center the image horizontally
    const xPos = margin; // Place image starting at left margin
    
    // Create PDF with custom dimensions
    const pdf = new jsPDF('p', 'mm', [pdfWidth, pageHeight]);
    
    // Add logo and title in header
    if (logoDataUrl) {
      // Add the app logo as a header image (left aligned)
      const logoSize = 12; // 12mm square logo for better visibility
      pdf.addImage(
        logoDataUrl,
        'PNG',
        margin,
        margin - 2, // Slight adjustment to vertical position
        logoSize,
        logoSize
      );

      // Title - positioned to the right of logo
      pdf.setFontSize(18);
      pdf.setTextColor(45, 90, 74); // Forest green color to match brand (#2d5a4a)
      pdf.text(
        recipeName,
        margin + logoSize + 4, // Leave 4mm space after logo
        margin + 6, // Center text vertically with logo
      );
    } else {
      // Fallback: text-only centered title if logo fails
      pdf.setFontSize(18);
      pdf.setTextColor(45, 90, 74); // Forest green
      pdf.text(recipeName, pdfWidth / 2, margin + 5, { align: 'center' });
    }
    
    // Add the recipe image (position below header area)
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      xPos, 
      headerHeight, // Start image below the header area
      imgWidth,
      imgHeight
    );
    
    // Add footer line
    const footerLineY = pageHeight - footerHeight + 5; // Position line relative to bottom
    pdf.setDrawColor(168, 213, 186); // Mint color for line
    pdf.line(margin, footerLineY, pdfWidth - margin, footerLineY);

    // Add footer text with app name and tagline
    pdf.setFontSize(9);
    pdf.setTextColor(107, 143, 113); // Sage green
    pdf.text('Generated by Sprout Notes - Ideas That Grow', pdfWidth / 2, footerLineY + 5, { align: 'center' }); 
    
    // Download the PDF
    pdf.save(`${recipeName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Restore original styles
    if (imageGenButton && originalImageBtnStyle !== undefined) imageGenButton.style.display = originalImageBtnStyle;
    if (actionButtons && originalActionBtnsStyle !== undefined) actionButtons.style.display = originalActionBtnsStyle;
  }
};

/**
 * Converts a data URL to a File object
 */
const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

/**
 * Shares a recipe using the Web Share API if available,
 * or falls back to copying a link to clipboard
 * @param recipe - The recipe object to share
 * @param shareUrl - The URL to share (optional, defaults to current URL)
 */
export const shareRecipe = async (
  recipe: { name: string; description?: string },
  shareUrl?: string
): Promise<void> => {
  const url = shareUrl || window.location.href;
  const title = `Sprout Notes: ${recipe.name}`;
  const text = recipe.description || `Check out this delicious vegan recipe: ${recipe.name}`;

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      // Try to include the logo image in the share
      let files: File[] | undefined;
      try {
        const logoDataUrl = await preloadImage(`${baseUrl}icons/icon-192x192.png`);
        const logoFile = await dataUrlToFile(logoDataUrl, 'sprout-notes-logo.png');
        // Check if file sharing is supported
        if (navigator.canShare && navigator.canShare({ files: [logoFile] })) {
          files = [logoFile];
        }
      } catch {
        // Logo loading failed, share without image
      }

      await navigator.share({
        title,
        text,
        url,
        ...(files && { files }),
      });
      return;
    } catch (error) {
      // If user cancels or share fails, fall back to clipboard
      console.log('Share canceled or failed, falling back to clipboard');
    }
  }

  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}\n\n${url}`);
    alert('Recipe link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    alert('Could not share recipe. Please copy the URL manually.');
  }
};
