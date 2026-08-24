import type { FeatureCollection, Polygon, LineString } from 'geojson';

// Brahmaputra basin (Majuli/Jorhat region in Assam)
export const elevationGeoJSONData: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { elevation: 2 }, // Riverbed
      geometry: {
        type: 'Polygon',
        coordinates: [[[94.00, 26.82], [94.08, 26.85], [94.15, 26.88], [94.25, 26.91], [94.25, 26.93], [94.15, 26.90], [94.08, 26.87], [94.00, 26.84], [94.00, 26.82]]]
      }
    },
    {
      type: 'Feature',
      properties: { elevation: 5 }, // Embankments
      geometry: {
        type: 'Polygon',
        coordinates: [[[94.00, 26.80], [94.10, 26.83], [94.18, 26.86], [94.25, 26.89], [94.25, 26.95], [94.18, 26.92], [94.10, 26.89], [94.00, 26.86], [94.00, 26.80]]]
      }
    },
    {
      type: 'Feature',
      properties: { elevation: 8 }, // Wide Floodplains
      geometry: {
        type: 'Polygon',
        coordinates: [[[93.95, 26.75], [94.10, 26.80], [94.20, 26.83], [94.30, 26.85], [94.30, 27.00], [94.20, 26.95], [94.10, 26.92], [93.95, 26.88], [93.95, 26.75]]]
      }
    }
  ]
};

export const roadNetworkGeoJSONData: FeatureCollection<LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'road-1' }, // Crosses lowland and mid
      geometry: {
        type: 'LineString',
        coordinates: [[94.08, 26.90], [94.20, 26.90]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'road-2' }, // Only in high ground
      geometry: {
        type: 'LineString',
        coordinates: [[94.15, 26.80], [94.22, 26.80]]
      }
    }
  ]
};
