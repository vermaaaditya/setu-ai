const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');

const basins = [
  { id: 'kosi', bounds: '26.00,86.50,26.20,86.70' },
  { id: 'kerala', bounds: '10.00,76.20,10.20,76.40' }
];

async function fetchOSM() {
  const targetDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  for (const basin of basins) {
    const query = `
      [out:json][timeout:60];
      (
        way["highway"~"primary|secondary|tertiary|residential|unclassified"](${basin.bounds});
      );
      out body;
      >;
      out skel qt;
    `;
    try {
      console.log(`Fetching from Overpass API for ${basin.id}...`);
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Setu.AI/1.0 (aaditya@setu.ai)'
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const geojson = osmtogeojson(data);
      
      geojson.features = geojson.features
        .filter(f => f.geometry.type === 'LineString')
        .map((f, i) => {
          f.properties = f.properties || {};
          f.properties.id = `osm-road-${basin.id}-${i}`;
          return f;
        });
      
      fs.writeFileSync(path.join(targetDir, `realRoads_${basin.id}.json`), JSON.stringify(geojson));
      console.log(`Success! Saved ${geojson.features.length} roads to realRoads_${basin.id}.json.`);
    } catch(e) {
      console.error(`Failed fetching OSM data for ${basin.id}:`, e);
    }
  }
}
fetchOSM();
