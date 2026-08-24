import type { FeatureCollection, Point } from 'geojson';

// Brahmaputra population clusters
export const populationGeoJSONData: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'pop-1', population: 3500 }, // Lowland cluster
      geometry: { type: 'Point', coordinates: [94.10, 26.90] }
    },
    {
      type: 'Feature',
      properties: { id: 'pop-2', population: 4200 }, // Lowland cluster
      geometry: { type: 'Point', coordinates: [94.12, 26.88] }
    },
    {
      type: 'Feature',
      properties: { id: 'pop-3', population: 6100 }, // Mid ground cluster
      geometry: { type: 'Point', coordinates: [94.20, 26.92] }
    },
    {
      type: 'Feature',
      properties: { id: 'pop-4', population: 8500 }, // High ground cluster
      geometry: { type: 'Point', coordinates: [94.18, 26.80] }
    }
  ]
};
