import React, { useMemo, useEffect, useState, useDeferredValue } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { calculateImpact } from '../lib/spatialEngine';
import { calculateEvacRoute } from '../lib/routingEngine';
import type { BasinConfig } from '../data/basinRegistry';
import styles from './CommandMap.module.css';

interface CommandMapProps {
  surgeHeight: number;
  pings?: any[];
  setStrandedPop?: (val: number) => void;
  theme?: 'dark' | 'light';
  activeBasin: BasinConfig;
  onMapClick?: (lat: number, lng: number) => void;
  frLocation?: [number, number] | null;
}

// Component to dynamically fly the map when basin changes
function MapRecenter({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Map Click Handler for Field Responder
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const CommandMap: React.FC<CommandMapProps> = ({ surgeHeight, pings = [], setStrandedPop, theme = 'dark', activeBasin, onMapClick, frLocation }) => {
  const [animKey, setAnimKey] = useState(0);
  
  // React 18 Concurrent Rendering: Defer heavy 20,000-road GeoJSON spatial math to background frames
  const deferredSurgeHeight = useDeferredValue(surgeHeight);

  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [surgeHeight]);

  const { floodedPolygons, deadRoadIDs, estimatedStrandedPopulation } = useMemo(() => {
    return calculateImpact(deferredSurgeHeight, activeBasin.elevationPolygons, activeBasin.roads as any, activeBasin.populationData as any);
  }, [deferredSurgeHeight, activeBasin]);

  // Update telemetry panel
  useEffect(() => {
    if (setStrandedPop) setStrandedPop(estimatedStrandedPopulation);
  }, [estimatedStrandedPopulation, setStrandedPop]);

  // Calculate Evacuation Route avoiding dead roads
  const evacRouteCoords = useMemo(() => {
    try {
      return calculateEvacRoute(activeBasin.breachPoint, activeBasin.safeCampPoint, deadRoadIDs, activeBasin.roads as any);
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

  const campIcon = new L.DivIcon({
    className: '',
    html: `<div style="background-color: #00F0FF; width: 28px; height: 28px; border-radius: 6px; border: 3px solid #FFF; box-shadow: 0 0 15px #00F0FF; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #000; font-weight: bold;">⛺</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const getPingIcon = (ping: any) => {
    let statusClass = ping.status === 'SAFE' ? styles.safe : styles.stranded;
    if (ping.needsMedical) statusClass = styles.medical;

    return new L.DivIcon({
      className: '',
      html: `<div class="${styles.arrivalPin} ${statusClass}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const frSelfIcon = new L.DivIcon({
    className: '',
    html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFF; box-shadow: 0 0 15px #3B82F6; animation: pulse 1.5s infinite;"></div>`,
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
        <MapClickHandler onMapClick={onMapClick} />
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
          <Marker key={ping.id} position={[ping.lat, ping.lng]} icon={getPingIcon(ping)} />
        ))}

        {/* FR Self Selection Pin */}
        {frLocation && (
          <Marker position={frLocation} icon={frSelfIcon}>
            <Popup>Your Selected Location</Popup>
          </Marker>
        )}

        {/* Safe Evacuation Camp Pin */}
        <Marker position={activeBasin.safeCampPoint} icon={campIcon}>
          <Popup>⛺ Safe Evacuation Camp</Popup>
        </Marker>

        {/* Radar Pulse Marker at Dam Breach */}
        <Marker key={`pulse-${animKey}`} position={activeBasin.breachPoint} icon={pulseIcon} />
      </MapContainer>
    </div>
  );
};

export default CommandMap;
