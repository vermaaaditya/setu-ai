import type { FeatureCollection, Polygon } from 'geojson';
import brahmaputraRoads from './realRoads.json';
import keralaRoads from './realRoads_kerala.json';
import sutlejRoads from './realRoads_sutlej.json';
import gangesRoads from './realRoads_ganges.json';

import { generateMockPopulation } from './mockPopulation';

export interface BasinConfig {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  breachPoint: [number, number];
  safeCampPoint: [number, number];
  roads: FeatureCollection;
  elevationPolygons: FeatureCollection<Polygon>;
  populationData: FeatureCollection;
}

// Helper to generate clean, non-self-intersecting river flood contour tiers (2m, 5m, 8m)
function generateRiverElevationPolygons(centerLat: number, centerLng: number): FeatureCollection<Polygon> {
  const dLat = 0.03;
  const dLng = 0.07;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { elevation: 2 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [centerLng - dLng, centerLat - dLat * 0.4],
            [centerLng + dLng, centerLat - dLat * 0.4],
            [centerLng + dLng, centerLat + dLat * 0.4],
            [centerLng - dLng, centerLat + dLat * 0.4],
            [centerLng - dLng, centerLat - dLat * 0.4]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { elevation: 5 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [centerLng - dLng * 1.6, centerLat - dLat * 0.8],
            [centerLng + dLng * 1.6, centerLat - dLat * 0.8],
            [centerLng + dLng * 1.6, centerLat + dLat * 0.8],
            [centerLng - dLng * 1.6, centerLat + dLat * 0.8],
            [centerLng - dLng * 1.6, centerLat - dLat * 0.8]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { elevation: 8 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [centerLng - dLng * 2.4, centerLat - dLat * 1.3],
            [centerLng + dLng * 2.4, centerLat - dLat * 1.3],
            [centerLng + dLng * 2.4, centerLat + dLat * 1.3],
            [centerLng - dLng * 2.4, centerLat + dLat * 1.3],
            [centerLng - dLng * 2.4, centerLat - dLat * 1.3]
          ]]
        }
      }
    ]
  };
}

export const basinRegistry: Record<string, BasinConfig> = {
  brahmaputra: {
    id: 'brahmaputra',
    name: 'Assam: Brahmaputra Breach',
    center: [26.85, 94.15],
    zoom: 11,
    breachPoint: [26.90, 94.08],
    safeCampPoint: [26.80, 94.20],
    roads: brahmaputraRoads as any,
    populationData: generateMockPopulation([26.75, 94.00, 26.95, 94.25]),
    elevationPolygons: generateRiverElevationPolygons(26.85, 94.15)
  },
  kerala: {
    id: 'kerala',
    name: 'Kerala: Periyar Overflow',
    center: [10.10, 76.30],
    zoom: 12,
    breachPoint: [10.12, 76.25],
    safeCampPoint: [10.05, 76.35],
    roads: keralaRoads as any,
    populationData: generateMockPopulation([10.00, 76.20, 10.20, 76.40]),
    elevationPolygons: generateRiverElevationPolygons(10.10, 76.30)
  },
  sutlej: {
    id: 'sutlej',
    name: 'Punjab: Sutlej River Basin',
    center: [30.98, 75.85],
    zoom: 11,
    breachPoint: [31.02, 75.80],
    safeCampPoint: [30.90, 75.90],
    roads: sutlejRoads as any,
    populationData: generateMockPopulation([30.90, 75.75, 31.05, 75.95]),
    elevationPolygons: generateRiverElevationPolygons(30.98, 75.85)
  },
  ganges: {
    id: 'ganges',
    name: 'Uttarakhand: Ganges (Haridwar)',
    center: [29.95, 78.15],
    zoom: 12,
    breachPoint: [29.98, 78.12],
    safeCampPoint: [29.91, 78.20],
    roads: gangesRoads as any,
    populationData: generateMockPopulation([29.90, 78.10, 30.00, 78.20]),
    elevationPolygons: generateRiverElevationPolygons(29.95, 78.15)
  }
};
