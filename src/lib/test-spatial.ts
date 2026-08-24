import { elevationGeoJSONData, roadNetworkGeoJSONData } from '../data/mockBasin';
import { calculateImpact } from './spatialEngine';

const testValues = [2, 5, 8];

console.log("=== SPATIAL ENGINE TEST ===\n");

testValues.forEach(surge => {
  const { floodedPolygons, deadRoadIDs } = calculateImpact(surge, elevationGeoJSONData, roadNetworkGeoJSONData);
  console.log(`Surge Height: ${surge}m`);
  console.log(`Flooded Polygons Count: ${floodedPolygons.features.length}`);
  console.log(`Dead Road IDs: ${deadRoadIDs.length > 0 ? deadRoadIDs.join(', ') : 'None'}\n`);
});
