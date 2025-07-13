// Script to copy JSON files to the dist folder
const fs = require('fs');
const path = require('path');

console.log('Starting copy-files.js script');

// Create Json directory in dist if it doesn't exist
const distJsonDir = path.join(__dirname, 'dist', 'Json');
if (!fs.existsSync(distJsonDir)) {
  console.log(`Creating directory: ${distJsonDir}`);
  fs.mkdirSync(distJsonDir, { recursive: true });
}

// Copy all JSON files from Json directory to dist/Json
const sourceJsonDir = path.join(__dirname, 'Json');
try {
  if (fs.existsSync(sourceJsonDir)) {
    console.log(`Source directory exists: ${sourceJsonDir}`);
    const files = fs.readdirSync(sourceJsonDir);
    console.log(`Found ${files.length} files in source directory`);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const sourcePath = path.join(sourceJsonDir, file);
        const destPath = path.join(distJsonDir, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to dist/Json`);
      }
    });
    console.log('All JSON files copied successfully!');
  } else {
    console.log(`Source directory does not exist: ${sourceJsonDir}`);
  }
} catch (error) {
  console.error('Error copying files:', error);
  // Don't fail the build if copying fails
}