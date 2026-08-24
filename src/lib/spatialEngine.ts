import type { FeatureCollection, Polygon, LineString, Point } from 'geojson';
import { booleanIntersects, booleanPointInPolygon } from '@turf/turf';

export function calculateImpact(
  surgeHeightInMeters: number,
  elevationGeoJSON: FeatureCollection<Polygon>,
  roadNetworkGeoJSON: FeatureCollection<LineString>,
  populationGeoJSON?: FeatureCollection<Point>
): { floodedPolygons: FeatureCollection<Polygon>; deadRoadIDs: string[]; estimatedStrandedPopulation: number } {
  
  // 1. Filter polygons where elevation <= surge height
  const floodedFeatures = elevationGeoJSON.features.filter(
    (feature) => (feature.properties?.elevation || 0) <= surgeHeightInMeters
  );

  const floodedPolygons: FeatureCollection<Polygon> = {
    type: 'FeatureCollection',
    features: floodedFeatures,
  };

  // 2. Find roads that intersect with any flooded polygon
  const deadRoadIDs: string[] = [];

  for (const road of roadNetworkGeoJSON.features) {
    let isFlooded = false;
    for (const floodedPoly of floodedPolygons.features) {
      if (booleanIntersects(road, floodedPoly)) {
        isFlooded = true;
        break;
      }
    }
    if (isFlooded && road.properties?.id) {
      deadRoadIDs.push(road.properties.id);
    }
  }

  // 3. Calculate Stranded Population (Brick 9)
  let estimatedStrandedPopulation = 0;
  if (populationGeoJSON) {
    for (const popPoint of populationGeoJSON.features) {
      for (const floodedPoly of floodedPolygons.features) {
        if (booleanPointInPolygon(popPoint, floodedPoly)) {
          estimatedStrandedPopulation += (popPoint.properties?.population || 0);
          break; // Don't count the same point twice if polygons overlap
        }
      }
    }
  }

  return { floodedPolygons, deadRoadIDs, estimatedStrandedPopulation };
}
