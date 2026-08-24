import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { calculateImpact } from '../lib/spatialEngine';
import { calculateEvacRoute } from '../lib/routingEngine';
import { BasinConfig } from '../data/basinRegistry';
import styles from './CommandMap.module.css';

interface CommandMapProps {
  surgeHeight: number;
  pings?: any[];
  setStrandedPop?: (val: number) => void;
  theme?: 'dark' | 'light';
  activeBasin: BasinConfig;
}

// Component to dynamically fly the map when basin changes
function MapRecenter({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

const CommandMap: React.FC<CommandMapProps> = ({ surgeHeight, pings = [], setStrandedPop, theme = 'dark', activeBasin }) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [surgeHeight]);

  const { floodedPolygons, deadRoadIDs, estimatedStrandedPopulation } = useMemo(() => {
    return calculateImpact(surgeHeight, activeBasin.elevationPolygons, activeBasin.roads, activeBasin.populationData);
  }, [surgeHeight, activeBasin]);

  // Update telemetry panel
  useEffect(() => {
    if (setStrandedPop) setStrandedPop(estimatedStrandedPopulation);
  }, [estimatedStrandedPopulation, setStrandedPop]);

  // Calculate Evacuation Route avoiding dead roads
  const evacRouteCoords = useMemo(() => {
    try {
      return calculateEvacRoute(activeBasin.breachPoint, activeBasin.safeCampPoint, deadRoadIDs, activeBasin.roads);
    } catch (e) {
      return []; // No path found
    }
  }, [deadRoadIDs, activeBasin]);

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

  const campIcon = new L.Icon.Default();

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
      <MapContainer center={activeBasin.center} zoom={activeBasin.zoom} style={{ height: '100%', width: '100%', backgroundColor: 'var(--bg-base)' }} zoomControl={false}>
        <MapRecenter center={activeBasin.center} zoom={activeBasin.zoom} />
        <TileLayer url={tileUrl} />

        <GeoJSON key={`roads-${activeBasin.id}`} data={activeBasin.roads} style={roadStyle} />

        {floodedPolygons.features.length > 0 && (
          <GeoJSON key={`flood-${activeBasin.id}-${surgeHeight}`} data={floodedPolygons as any} style={floodStyle} />
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

        <Marker position={activeBasin.safeCampPoint} icon={campIcon}>
          <Popup>Safe Evacuation Camp</Popup>
        </Marker>

        <Marker position={activeBasin.breachPoint} icon={campIcon}>
          <Popup>Breach / Stranded Origin</Popup>
        </Marker>

        {/* Radar Pulse Marker at Dam Breach */}
        {surgeHeight > 0 && (
          <Marker key={`pulse-${animKey}`} position={activeBasin.breachPoint} icon={pulseIcon} />
        )}
      </MapContainer>
    </div>
  );
};

export default CommandMap;
