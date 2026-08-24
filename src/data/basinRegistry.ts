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

// Helper to generate clean, oriented river flood contour tiers (2m, 5m, 8m) directly over breach point
function generateRiverElevationPolygons(
  breachLat: number, 
  breachLng: number, 
  orientation: 'HORIZONTAL' | 'VERTICAL' = 'HORIZONTAL'
): FeatureCollection<Polygon> {
  const isVert = orientation === 'VERTICAL';
  
  const dLng1 = isVert ? 0.025 : 0.06;
  const dLat1 = isVert ? 0.06 : 0.025;

  const dLng2 = isVert ? 0.045 : 0.10;
  const dLat2 = isVert ? 0.10 : 0.045;

  const dLng3 = isVert ? 0.07 : 0.14;
  const dLat3 = isVert ? 0.14 : 0.07;

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { elevation: 2 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [breachLng - dLng1, breachLat - dLat1],
            [breachLng + dLng1, breachLat - dLat1],
            [breachLng + dLng1, breachLat + dLat1],
            [breachLng - dLng1, breachLat + dLat1],
            [breachLng - dLng1, breachLat - dLat1]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { elevation: 5 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [breachLng - dLng2, breachLat - dLat2],
            [breachLng + dLng2, breachLat - dLat2],
            [breachLng + dLng2, breachLat + dLat2],
            [breachLng - dLng2, breachLat + dLat2],
            [breachLng - dLng2, breachLat - dLat2]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { elevation: 8 },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [breachLng - dLng3, breachLat - dLat3],
            [breachLng + dLng3, breachLat - dLat3],
            [breachLng + dLng3, breachLat + dLat3],
            [breachLng - dLng3, breachLat + dLat3],
            [breachLng - dLng3, breachLat - dLat3]
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
    elevationPolygons: generateRiverElevationPolygons(26.90, 94.08, 'HORIZONTAL')
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
    elevationPolygons: generateRiverElevationPolygons(10.12, 76.25, 'HORIZONTAL')
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
    elevationPolygons: generateRiverElevationPolygons(31.02, 75.80, 'HORIZONTAL')
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
    elevationPolygons: generateRiverElevationPolygons(29.98, 78.12, 'VERTICAL')
  }
};
