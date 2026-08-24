import tokml from 'tokml';
import type { FeatureCollection, Polygon } from 'geojson';

export function exportFloodZonesToKML(floodedPolygons: FeatureCollection<Polygon>, surgeHeight: number) {
  if (floodedPolygons.features.length === 0) {
    alert("No flooded zones to export at this surge level.");
    return;
  }

  // tokml requires name and description in properties if you want them to show in Google Earth
  const formattedGeoJSON = {
    ...floodedPolygons,
    features: floodedPolygons.features.map((f, i) => ({
      ...f,
      properties: {
        name: `Flood Zone ${i+1}`,
        description: `Simulated flood extent at ${surgeHeight}m surge.`,
        ...f.properties
      }
    }))
  };

  const kmlString = tokml(formattedGeoJSON);
  
  const blob = new Blob([kmlString], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Assam_Flood_Zones_${surgeHeight}m.kml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
