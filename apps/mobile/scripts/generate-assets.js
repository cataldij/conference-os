#!/usr/bin/env node

/**
 * Asset Generation Script for Conference OS
 *
 * This script converts SVG assets to PNG format for the Expo build.
 *
 * Run: npm run generate-assets
 * Or: node scripts/generate-assets.js
 *
 * Requires: sharp (will be installed automatically)
 */

const fs = require('fs');
const path = require('path');

async function generateAssets() {
  let sharp;

  try {
    sharp = require('sharp');
  } catch (e) {
    console.log('Installing sharp for image processing...');
    const { execSync } = require('child_process');
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
  }

  const assetsDir = path.join(__dirname, '..', 'assets');

  const conversions = [
    { input: 'icon.svg', output: 'icon.png', width: 1024, height: 1024 },
    { input: 'splash.svg', output: 'splash.png', width: 1284, height: 2778 },
    { input: 'adaptive-icon.svg', output: 'adaptive-icon.png', width: 1024, height: 1024 },
    { input: 'favicon.svg', output: 'favicon.png', width: 48, height: 48 },
    { input: 'notification-icon.svg', output: 'notification-icon.png', width: 96, height: 96 },
  ];

  console.log('🎨 Generating PNG assets from SVG files...\n');

  for (const { input, output, width, height } of conversions) {
    const inputPath = path.join(assetsDir, input);
    const outputPath = path.join(assetsDir, output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${input} (file not found)`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(width, height)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${output} (${width}x${height})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${output}:`, error.message);
    }
  }

  console.log('\n✨ Asset generation complete!');
  console.log('\nNext steps:');
  console.log('1. Review the generated assets in apps/mobile/assets/');
  console.log('2. Replace with custom designs if needed');
  console.log('3. Run: eas build --profile development');
}

generateAssets().catch(console.error);
