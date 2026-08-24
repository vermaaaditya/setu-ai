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

// Generate 100% circular concentric flood inundation rings centered on the river breach point
function generateConcentricCirclePolygons(breachLat: number, breachLng: number): FeatureCollection<Polygon> {
  const createCircle = (radiusKm: number, elevation: number) => {
    const points = 36;
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
      createCircle(2.2, 2), // 2m surge: 2.2 km radius
      createCircle(5.0, 5), // 5m surge: 5.0 km radius
      createCircle(8.5, 8)  // 8m surge: 8.5 km radius
    ]
  };
}

export const basinRegistry: Record<string, BasinConfig> = {
  brahmaputra: {
    id: 'brahmaputra',
    name: 'Assam: Brahmaputra Breach',
    center: [26.84, 94.15],
    zoom: 11,
    breachPoint: [26.885, 94.120], // Directly on main Brahmaputra river channel
    safeCampPoint: [26.78, 94.20],   // Safe high-ground camp south of river
    roads: brahmaputraRoads as any,
    populationData: generateMockPopulation([26.75, 94.00, 26.95, 94.25]),
    elevationPolygons: generateConcentricCirclePolygons(26.885, 94.120)
  },
  sutlej: {
    id: 'sutlej',
    name: 'Punjab: Sutlej River Basin',
    center: [30.94, 75.83],
    zoom: 11,
    breachPoint: [30.985, 75.825], // Directly on Sutlej River channel near Phillaur bridge
    safeCampPoint: [30.87, 75.88],  // Safe high-ground camp in southern Ludhiana
    roads: sutlejRoads as any,
    populationData: generateMockPopulation([30.85, 75.75, 31.00, 75.95]),
    elevationPolygons: generateConcentricCirclePolygons(30.985, 75.825)
  },
  ganges: {
    id: 'ganges',
    name: 'Uttarakhand: Ganges (Haridwar)',
    center: [29.94, 78.15],
    zoom: 12,
    breachPoint: [29.965, 78.162], // Directly on Ganges main river channel near Har Ki Pauri
    safeCampPoint: [29.90, 78.18],  // Safe high-ground camp south of Haridwar
    roads: gangesRoads as any,
    populationData: generateMockPopulation([29.90, 78.10, 30.00, 78.20]),
    elevationPolygons: generateConcentricCirclePolygons(29.965, 78.162)
  }
};
