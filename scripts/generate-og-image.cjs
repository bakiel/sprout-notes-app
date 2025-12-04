// Script to generate Open Graph image for social sharing
// Run with: node scripts/generate-og-image.js

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  // Standard OG image size for WhatsApp/Facebook
  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient (brand colors)
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e8f5e9'); // Light mint
  gradient.addColorStop(1, '#c8e6c9'); // Slightly darker mint
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern/texture
  ctx.strokeStyle = 'rgba(46, 125, 50, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  // Load and draw the logo
  try {
    const logoPath = path.join(__dirname, '../public/icons/icon-512x512.png');
    const logo = await loadImage(logoPath);

    // Draw logo centered, scaled appropriately
    const logoWidth = 800;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    const logoX = (width - logoWidth) / 2;
    const logoY = (height - logoHeight) / 2 - 40;

    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.log('Could not load logo, using text only:', err.message);

    // Fallback: Draw text
    ctx.fillStyle = '#2e7d32';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sprout Notes', width / 2, height / 2 - 20);

    ctx.fillStyle = '#666666';
    ctx.font = '36px Arial';
    ctx.fillText('IDEAS THAT GROW', width / 2, height / 2 + 40);
  }

  // Add tagline at bottom
  ctx.fillStyle = '#2e7d32';
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('AI-Powered Vegan Recipe Generator', width / 2, height - 60);

  // Save the image
  const outputPath = path.join(__dirname, '../public/og/og-image.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);

  console.log('OG image generated:', outputPath);
}

generateOGImage().catch(console.error);
