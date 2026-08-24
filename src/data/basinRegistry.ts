import type { FeatureCollection, Polygon } from 'geojson';
import brahmaputraRoads from './realRoads.json';
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

// Generate realistic elongated river corridor flood ribbons centered at the river breach
function generateRiverRibbonPolygons(
  breachLat: number, 
  breachLng: number, 
  flowDirection: 'EAST_WEST' | 'NORTH_SOUTH' = 'EAST_WEST'
): FeatureCollection<Polygon> {
  const isEW = flowDirection === 'EAST_WEST';
  
  // River channel width (narrow across, long along the flow)
  const dLat1 = isEW ? 0.015 : 0.06;
  const dLng1 = isEW ? 0.06 : 0.015;

  // Tier 2 flood plain expansion
  const dLat2 = isEW ? 0.035 : 0.10;
  const dLng2 = isEW ? 0.10 : 0.035;

  // Tier 3 severe inundation
  const dLat3 = isEW ? 0.06 : 0.15;
  const dLng3 = isEW ? 0.15 : 0.06;

  const createRibbon = (dLat: number, dLng: number, elevation: number) => ({
    type: 'Feature' as const,
    properties: { elevation },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[
        [breachLng - dLng, breachLat - dLat * 0.4],
        [breachLng + dLng, breachLat - dLat * 0.4],
        [breachLng + dLng, breachLat + dLat * 1.6], // Overflows southward into city roads!
        [breachLng - dLng, breachLat + dLat * 1.6],
        [breachLng - dLng, breachLat - dLat * 0.4]
      ]]
    }
  });

  return {
    type: 'FeatureCollection',
    features: [
      createRibbon(dLat1, dLng1, 2),
      createRibbon(dLat2, dLng2, 5),
      createRibbon(dLat3, dLng3, 8)
    ]
  };
}

export const basinRegistry: Record<string, BasinConfig> = {
  brahmaputra: {
    id: 'brahmaputra',
    name: 'Assam: Brahmaputra Breach',
    center: [26.85, 94.15],
    zoom: 11,
    breachPoint: [26.88, 94.10],
    safeCampPoint: [26.78, 94.20],
    roads: brahmaputraRoads as any,
    populationData: generateMockPopulation([26.75, 94.00, 26.95, 94.25]),
    elevationPolygons: generateRiverRibbonPolygons(26.88, 94.10, 'EAST_WEST')
  },
  sutlej: {
    id: 'sutlej',
    name: 'Punjab: Sutlej River Basin',
    center: [30.93, 75.83],
    zoom: 12,
    breachPoint: [30.955, 75.825], // Directly on Sutlej River Bridge north of Ludhiana!
    safeCampPoint: [30.87, 75.88],  // High ground southern evacuation camp
    roads: sutlejRoads as any,
    populationData: generateMockPopulation([30.85, 75.75, 31.00, 75.95]),
    elevationPolygons: generateRiverRibbonPolygons(30.955, 75.825, 'EAST_WEST')
  },
  ganges: {
    id: 'ganges',
    name: 'Uttarakhand: Ganges (Haridwar)',
    center: [29.95, 78.15],
    zoom: 12,
    breachPoint: [29.96, 78.14],
    safeCampPoint: [29.90, 78.18],
    roads: gangesRoads as any,
    populationData: generateMockPopulation([29.90, 78.10, 30.00, 78.20]),
    elevationPolygons: generateRiverRibbonPolygons(29.96, 78.14, 'NORTH_SOUTH')
  }
};
