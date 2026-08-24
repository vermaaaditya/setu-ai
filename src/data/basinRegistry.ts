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

// Universal Radial Flood Inundation Generator (Concentric circles around breach origin)
// 100% orientation-independent, mathematically smooth, fits any river/dam breach scenario!
function generateConcentricFloodPolygons(breachLat: number, breachLng: number): FeatureCollection<Polygon> {
  const createCirclePolygon = (radiusKm: number, elevation: number) => {
    const points = 32;
    const coords: [number, number][] = [];
    const kmPerDegreeLat = 111;
    const kmPerDegreeLng = 111 * Math.cos((breachLat * Math.PI) / 180);

    for (let i = 0; i <= points; i++) {
      const theta = (i / points) * (2 * Math.PI);
      const latOffset = (radiusKm / kmPerDegreeLat) * Math.sin(theta);
      const lngOffset = (radiusKm / kmPerDegreeLng) * Math.cos(theta);
      coords.push([breachLng + lngOffset, breachLat + latOffset]);
    }

    return {
      type: 'Feature' as const,
      properties: { elevation },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coords]
      }
    };
  };

  return {
    type: 'FeatureCollection',
    features: [
      createCirclePolygon(2.0, 2), // 2m surge: 2.0 km radius
      createCirclePolygon(4.5, 5), // 5m surge: 4.5 km radius
      createCirclePolygon(7.5, 8)  // 8m surge: 7.5 km radius
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
    elevationPolygons: generateConcentricFloodPolygons(26.90, 94.08)
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
    elevationPolygons: generateConcentricFloodPolygons(31.02, 75.80)
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
    elevationPolygons: generateConcentricFloodPolygons(29.98, 78.12)
  }
};
