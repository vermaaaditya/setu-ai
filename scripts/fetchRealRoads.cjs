const fs = require('fs');
const path = require('path');
const osmtogeojson = require('osmtogeojson');

async function fetchOSM() {
  const query = `
    [out:json][timeout:60];
    (
      way["highway"~"primary|secondary|tertiary|residential|unclassified"](26.75,94.00,26.95,94.25);
    );
    out body;
    >;
    out skel qt;
  `;
  try {
    console.log("Fetching from Overpass API...");
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Setu.AI/1.0 (aaditya@setu.ai)'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Parsing OSM JSON to GeoJSON...");
    const geojson = osmtogeojson(data);
    
    geojson.features = geojson.features
      .filter(f => f.geometry.type === 'LineString')
      .map((f, i) => {
        f.properties = f.properties || {};
        f.properties.id = `osm-road-${i}`;
        return f;
      });

    const targetDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    
    fs.writeFileSync(path.join(targetDir, 'realRoads.json'), JSON.stringify(geojson));
    console.log(`Success! Saved ${geojson.features.length} real road segments to realRoads.json.`);
  } catch(e) {
    console.error("Failed fetching OSM data:", e);
  }
}
fetchOSM();
