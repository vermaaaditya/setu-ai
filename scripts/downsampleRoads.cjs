const fs = require('fs');
const path = require('path');

const files = [
  'realRoads.json',
  'realRoads_sutlej.json',
  'realRoads_ganges.json'
];

const dataDir = path.join(__dirname, '../src/data');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (content.features) {
    // Cap at 1000 main arterial roads for instant 60fps rendering
    content.features = content.features.slice(0, 1000);
  }

  fs.writeFileSync(filePath, JSON.stringify(content));
  console.log(`Downsampled ${file} to ${content.features.length} roads.`);
});
