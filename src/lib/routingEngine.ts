import createGraph from 'ngraph.graph';
import path from 'ngraph.path';
import type { FeatureCollection, LineString } from 'geojson';

export function calculateEvacRoute(
  startCoord: [number, number],
  safeCampCoord: [number, number],
  deadRoadIDs: string[],
  roadNetworkGeoJSON: FeatureCollection<LineString>
): [number, number][] {
  const graph = createGraph();

  // Build the graph from the road network LineStrings
  roadNetworkGeoJSON.features.forEach(road => {
    if (road.properties && deadRoadIDs.includes(road.properties.id)) {
      return; // Skip dead roads entirely
    }

    const coords = road.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const fromId = `${coords[i][1]},${coords[i][0]}`; // Lat, Lng
      const toId = `${coords[i+1][1]},${coords[i+1][0]}`;
      
      // Calculate basic euclidean distance for edge weight
      const dx = coords[i][0] - coords[i+1][0];
      const dy = coords[i][1] - coords[i+1][1];
      const distance = Math.sqrt(dx * dx + dy * dy);

      graph.addNode(fromId, { lat: coords[i][1], lng: coords[i][0] });
      graph.addNode(toId, { lat: coords[i+1][1], lng: coords[i+1][0] });
      
      // Bi-directional road for simplicity
      graph.addLink(fromId, toId, { weight: distance });
      graph.addLink(toId, fromId, { weight: distance });
    }
  });

  // Start and end IDs based on coordinate arrays [lat, lng]
  const startId = `${startCoord[0]},${startCoord[1]}`;
  const endId = `${safeCampCoord[0]},${safeCampCoord[1]}`;

  const pathFinder = path.aStar(graph, {
    distance(fromNode, toNode, link) {
      return link.data.weight;
    }
  });

  const foundPath = pathFinder.find(startId, endId);
  
  // ngraph returns path from target to source, so we reverse it
  return foundPath.reverse().map(node => [node.data.lat, node.data.lng]);
}
