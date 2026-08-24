import { FeatureCollection, Point } from 'geojson';

export function generateMockPopulation(bounds: [number, number, number, number], count: number = 300): FeatureCollection<Point> {
  const features: any[] = [];
  const [minLat, minLng, maxLat, maxLng] = bounds;
  for (let i = 0; i < count; i++) {
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lng = minLng + Math.random() * (maxLng - minLng);
    features.push({
      type: 'Feature',
      properties: { population: Math.floor(Math.random() * 50) + 10 },
      geometry: { type: 'Point', coordinates: [lng, lat] }
    });
  }
  return { type: 'FeatureCollection', features };
}

export const populationGeoJSONData = generateMockPopulation([26.75, 94.00, 26.95, 94.25]);
