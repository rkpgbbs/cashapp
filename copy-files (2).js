// Script to copy JSON files to the dist folder
const fs = require('fs');
const path = require('path');

// Create Json directory in dist if it doesn't exist
const distJsonDir = path.join(__dirname, 'dist', 'Json');
if (!fs.existsSync(distJsonDir)) {
  fs.mkdirSync(distJsonDir, { recursive: true });
}

// Copy all JSON files from Json directory to dist/Json
const sourceJsonDir = path.join(__dirname, 'Json');
fs.readdirSync(sourceJsonDir).forEach(file => {
  if (file.endsWith('.json')) {
    const sourcePath = path.join(sourceJsonDir, file);
    const destPath = path.join(distJsonDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied ${file} to dist/Json`);
  }
});

console.log('All JSON files copied successfully!');
