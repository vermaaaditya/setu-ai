import createGraph from 'ngraph.graph';
import path from 'ngraph.path';
import type { FeatureCollection, LineString } from 'geojson';

const graphCache = new WeakMap<FeatureCollection<LineString>, any>();

function getOrCreateGraph(roadNetworkGeoJSON: FeatureCollection<LineString>) {
  if (graphCache.has(roadNetworkGeoJSON)) {
    return graphCache.get(roadNetworkGeoJSON);
  }

  const graph = createGraph();
  roadNetworkGeoJSON.features.forEach(road => {
    const roadId = road.properties?.id;
    const coords = road.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const fromId = `${coords[i][1]},${coords[i][0]}`;
      const toId = `${coords[i+1][1]},${coords[i+1][0]}`;
      
      const dx = coords[i][0] - coords[i+1][0];
      const dy = coords[i][1] - coords[i+1][1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      graph.addNode(fromId, { lat: coords[i][1], lng: coords[i][0] });
      graph.addNode(toId, { lat: coords[i+1][1], lng: coords[i+1][0] });
      
      graph.addLink(fromId, toId, { weight: distance, roadId });
      graph.addLink(toId, fromId, { weight: distance, roadId });
    }
  });

  graphCache.set(roadNetworkGeoJSON, graph);
  return graph;
}

export function calculateEvacRoute(
  startCoord: [number, number],
  safeCampCoord: [number, number],
  deadRoadIDs: string[],
  roadNetworkGeoJSON: FeatureCollection<LineString>
): [number, number][] {
  const graph = getOrCreateGraph(roadNetworkGeoJSON);
  const deadSet = new Set(deadRoadIDs);

  const startId = `${startCoord[0]},${startCoord[1]}`;
  const endId = `${safeCampCoord[0]},${safeCampCoord[1]}`;

  const pathFinder = path.aStar(graph, {
    distance(_fromNode, _toNode, link) {
      const data = link.data as any;
      if (data?.roadId && deadSet.has(data.roadId)) {
        return 1e9; // Penalty weight for dead/flooded road
      }
      return data?.weight || 1;
    }
  });

  const foundPath = pathFinder.find(startId, endId);
  return foundPath.reverse().map(node => {
    const data = node.data as any;
    return [data.lat, data.lng];
  });
}
