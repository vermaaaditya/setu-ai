import type { FeatureCollection, Polygon } from 'geojson';
import brahmaputraRoads from './realRoads.json';
import kosiRoads from './realRoads_kosi.json';
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
    elevationPolygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', properties: { elevation: 2 },
          geometry: { type: 'Polygon', coordinates: [[[94.00, 26.82], [94.08, 26.85], [94.15, 26.88], [94.25, 26.91], [94.25, 26.93], [94.15, 26.90], [94.08, 26.87], [94.00, 26.84], [94.00, 26.82]]] }
        },
        {
          type: 'Feature', properties: { elevation: 5 },
          geometry: { type: 'Polygon', coordinates: [[[94.00, 26.80], [94.10, 26.83], [94.18, 26.86], [94.25, 26.89], [94.25, 26.95], [94.18, 26.92], [94.10, 26.89], [94.00, 26.86], [94.00, 26.80]]] }
        },
        {
          type: 'Feature', properties: { elevation: 8 },
          geometry: { type: 'Polygon', coordinates: [[[93.95, 26.75], [94.10, 26.80], [94.20, 26.83], [94.30, 26.85], [94.30, 27.00], [94.20, 26.95], [94.10, 26.92], [93.95, 26.88], [93.95, 26.75]]] }
        }
      ]
    }
  },
  kosi: {
    id: 'kosi',
    name: 'Bihar: Kosi River Flood',
    center: [26.10, 86.60],
    zoom: 11,
    breachPoint: [26.15, 86.58],
    safeCampPoint: [26.05, 86.65],
    roads: kosiRoads as any,
    populationData: generateMockPopulation([26.00, 86.50, 26.20, 86.70]),
    elevationPolygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', properties: { elevation: 2 },
          geometry: { type: 'Polygon', coordinates: [[[86.55, 26.20], [86.58, 26.10], [86.60, 26.00], [86.62, 26.00], [86.60, 26.10], [86.57, 26.20], [86.55, 26.20]]] }
        },
        {
          type: 'Feature', properties: { elevation: 5 },
          geometry: { type: 'Polygon', coordinates: [[[86.52, 26.20], [86.55, 26.10], [86.57, 26.00], [86.65, 26.00], [86.63, 26.10], [86.60, 26.20], [86.52, 26.20]]] }
        },
        {
          type: 'Feature', properties: { elevation: 8 },
          geometry: { type: 'Polygon', coordinates: [[[86.50, 26.20], [86.52, 26.10], [86.55, 26.00], [86.68, 26.00], [86.65, 26.10], [86.63, 26.20], [86.50, 26.20]]] }
        }
      ]
    }
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
    elevationPolygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', properties: { elevation: 2 },
          geometry: { type: 'Polygon', coordinates: [[[76.20, 10.12], [76.30, 10.15], [76.40, 10.10], [76.40, 10.12], [76.30, 10.17], [76.20, 10.14], [76.20, 10.12]]] }
        },
        {
          type: 'Feature', properties: { elevation: 5 },
          geometry: { type: 'Polygon', coordinates: [[[76.20, 10.10], [76.30, 10.13], [76.40, 10.08], [76.40, 10.14], [76.30, 10.19], [76.20, 10.16], [76.20, 10.10]]] }
        },
        {
          type: 'Feature', properties: { elevation: 8 },
          geometry: { type: 'Polygon', coordinates: [[[76.20, 10.08], [76.30, 10.11], [76.40, 10.06], [76.40, 10.16], [76.30, 10.21], [76.20, 10.18], [76.20, 10.08]]] }
        }
      ]
    }
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
    elevationPolygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', properties: { elevation: 2 },
          geometry: { type: 'Polygon', coordinates: [[[75.75, 31.02], [75.85, 31.00], [75.95, 30.98], [75.95, 31.00], [75.85, 31.02], [75.75, 31.04], [75.75, 31.02]]] }
        },
        {
          type: 'Feature', properties: { elevation: 5 },
          geometry: { type: 'Polygon', coordinates: [[[75.75, 31.00], [75.85, 30.98], [75.95, 30.96], [75.95, 31.02], [75.85, 31.04], [75.75, 31.06], [75.75, 31.00]]] }
        },
        {
          type: 'Feature', properties: { elevation: 8 },
          geometry: { type: 'Polygon', coordinates: [[[75.75, 30.95], [75.85, 30.93], [75.95, 30.91], [75.95, 31.05], [75.85, 31.07], [75.75, 31.09], [75.75, 30.95]]] }
        }
      ]
    }
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
    elevationPolygons: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature', properties: { elevation: 2 },
          geometry: { type: 'Polygon', coordinates: [[[78.10, 29.97], [78.15, 29.95], [78.20, 29.93], [78.20, 29.95], [78.15, 29.97], [78.10, 29.99], [78.10, 29.97]]] }
        },
        {
          type: 'Feature', properties: { elevation: 5 },
          geometry: { type: 'Polygon', coordinates: [[[78.10, 29.95], [78.15, 29.93], [78.20, 29.91], [78.20, 29.97], [78.15, 29.99], [78.10, 30.01], [78.10, 29.95]]] }
        },
        {
          type: 'Feature', properties: { elevation: 8 },
          geometry: { type: 'Polygon', coordinates: [[[78.10, 29.92], [78.15, 29.90], [78.20, 29.88], [78.20, 30.00], [78.15, 30.02], [78.10, 30.04], [78.10, 29.92]]] }
        }
      ]
    }
  }
};
