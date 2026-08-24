const fs = require('fs');
const path = require('path');

const files = [
  'realRoads.json',
  'realRoads_kerala.json',
  'realRoads_sutlej.json',
  'realRoads_ganges.json'
];

const dataDir = path.join(__dirname, '../src/data');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) return;

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (content.features) {
    content.features = content.features.map(f => {
      if (f.geometry && f.geometry.coordinates) {
        f.geometry.coordinates = f.geometry.coordinates.map(coord => [
          Number(coord[0].toFixed(4)),
          Number(coord[1].toFixed(4))
        ]);
      }
      // Keep only id in properties to save massive JSON space
      f.properties = { id: f.properties.id };
      return f;
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(content));
  console.log(`Optimized ${file}`);
});
