import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { elevationGeoJSONData } from '../data/mockBasin';
import realRoadsData from '../data/realRoads.json';
import { populationGeoJSONData } from '../data/mockPopulation';
import { calculateImpact } from '../lib/spatialEngine';
import { calculateEvacRoute } from '../lib/routingEngine';
import styles from './CommandMap.module.css';

interface CommandMapProps {
  surgeHeight: number;
  pings?: any[];
  setStrandedPop?: (val: number) => void;
  theme?: 'dark' | 'light';
}

const breachPoint: [number, number] = [26.90, 94.08]; // Riverbank breach
const safeCampPoint: [number, number] = [26.80, 94.20]; // High ground camp

const CommandMap: React.FC<CommandMapProps> = ({ surgeHeight, pings = [], setStrandedPop, theme = 'dark' }) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [surgeHeight]);

  const { floodedPolygons, deadRoadIDs, estimatedStrandedPopulation } = useMemo(() => {
    return calculateImpact(surgeHeight, elevationGeoJSONData, realRoadsData as any, populationGeoJSONData);
  }, [surgeHeight]);

  // Update telemetry panel
  useEffect(() => {
    if (setStrandedPop) setStrandedPop(estimatedStrandedPopulation);
  }, [estimatedStrandedPopulation, setStrandedPop]);

  // Calculate Evacuation Route avoiding dead roads
  const evacRouteCoords = useMemo(() => {
    // A mock road network node starting point (e.g. from a stranded population cluster)
    // We try to find a path from [26.90, 94.08] to Safe Camp [26.80, 94.20]
    try {
      return calculateEvacRoute([26.90, 94.08], safeCampPoint, deadRoadIDs, realRoadsData as any);
    } catch (e) {
      return []; // No path found
    }
  }, [deadRoadIDs]);

  const roadStyle = (feature: any) => {
    const isDead = deadRoadIDs.includes(feature.properties.id);
    return { color: isDead ? '#4B5563' : '#34D399', weight: 3, opacity: isDead ? 0.4 : 1 };
  };

  const floodStyle = { color: 'transparent', fillColor: '#FFB020', fillOpacity: 0.3, weight: 1 };

  const pulseIcon = new L.DivIcon({
    className: styles.radarPulseMarker,
    html: `<div class="${styles.radarPulse}" key="${animKey}"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  const getPingIcon = (status: string) => new L.DivIcon({
    className: '',
    html: `<div class="${styles.arrivalPin} ${status === 'SAFE' ? styles.safe : styles.stranded}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={[26.85, 94.15]} zoom={11} style={{ height: '100%', width: '100%', backgroundColor: 'var(--bg-base)' }} zoomControl={false}>
        <TileLayer url={tileUrl} />

        <GeoJSON key="roads" data={realRoadsData as any} style={roadStyle} />

        {floodedPolygons.features.length > 0 && (
          <GeoJSON key={`flood-${surgeHeight}`} data={floodedPolygons as any} style={floodStyle} />
        )}

        {/* Evacuation Route */}
        {evacRouteCoords.length > 0 && (
          <Polyline 
            key={`route-${animKey}`} 
            positions={evacRouteCoords} 
            pathOptions={{ color: 'var(--safe-cyan)', weight: 4, className: styles.evacRoute }} 
          />
        )}

        {/* Responder Pins */}
        {pings.map(ping => (
          <Marker key={ping.id} position={[ping.lat, ping.lng]} icon={getPingIcon(ping.status)} />
        ))}

        {/* Radar Pulse Marker at Dam Breach */}
        {surgeHeight > 0 && (
          <Marker key={`pulse-${animKey}`} position={breachPoint} icon={pulseIcon} />
        )}
      </MapContainer>
    </div>
  );
};

export default CommandMap;
