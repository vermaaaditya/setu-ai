import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { basinRegistry } from '../data/basinRegistry';
import { CitizenChatbot } from '../components/CitizenChatbot';

interface ContextType {
  theme: 'dark' | 'light';
  selectedBasinId: string;
  surgeHeight: number;
}

function LocationPicker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const pinIcon = new L.DivIcon({
    className: '',
    html: `<div style="background-color: #34D399; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFF; box-shadow: 0 0 15px #34D399; animation: pulse 1.5s infinite;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return position === null ? null : (
    <Marker position={position} icon={pinIcon}>
      <Popup>Your Location</Popup>
    </Marker>
  );
}

// Calculate Haversine distance in KM
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const NavigationRoute: React.FC = () => {
  const { selectedBasinId, theme, surgeHeight } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const [userLocation, setUserLocation] = useState<[number, number]>(activeBasin.center);

  const safeCamp = activeBasin.safeCampPoint;
  const distanceKm = getDistanceKm(userLocation[0], userLocation[1], safeCamp[0], safeCamp[1]);
  const walkingTimeMins = Math.round((distanceKm / 4.5) * 60); // 4.5 km/h walking speed

  const campIcon = new L.DivIcon({
    className: '',
    html: `<div style="background-color: #00F0FF; width: 28px; height: 28px; border-radius: 6px; border: 3px solid #FFF; box-shadow: 0 0 20px #00F0FF; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #000;">⛺</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${safeCamp[0]},${safeCamp[1]}&travelmode=walking`;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* Lightweight Full-Screen Map */}
      <MapContainer center={activeBasin.center} zoom={activeBasin.zoom} style={{ height: '100%', width: '100%', backgroundColor: 'var(--bg-base)' }} zoomControl={true}>
        <TileLayer url={tileUrl} />
        <LocationPicker position={userLocation} setPosition={setUserLocation} />
        <Marker position={safeCamp} icon={campIcon}>
          <Popup>NDRF Safe Evacuation Camp</Popup>
        </Marker>
        <Polyline 
          positions={[userLocation, safeCamp]} 
          pathOptions={{ color: 'var(--responder-green)', weight: 5, dashArray: '10, 10' }} 
        />
      </MapContainer>

      {/* Top Left Navigation Label */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 1000, 
        backgroundColor: 'var(--bg-panel)', padding: '12px 20px',
        border: '1px solid var(--safe-cyan)', borderRadius: '6px',
        color: 'var(--text-primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--safe-cyan)', fontWeight: 'bold', letterSpacing: '0.1em' }}>
          CIVILIAN EVACUATION NAVIGATOR
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0' }}>
          Region: {activeBasin.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Tap anywhere on map to drop your position pin
        </div>
      </div>

      {/* Bottom Telemetry Overlay & Google Maps Trigger */}
      <div style={{
        position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'var(--bg-panel)', padding: '20px 24px', borderRadius: '8px',
        border: '1px solid var(--grid-line)', width: '90%', maxWidth: '700px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '4px' }}>
            NEAREST NDRF SHELTER DISTANCE
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--responder-green)' }}>
            {distanceKm.toFixed(2)} KM
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Est. Walking Time: ~{walkingTimeMins} mins
          </div>
        </div>

        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: 'var(--safe-cyan)',
            color: '#000',
            padding: '14px 24px',
            borderRadius: '6px',
            fontWeight: '900',
            fontSize: '14px',
            textDecoration: 'none',
            letterSpacing: '0.05em',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}
        >
          🧭 OPEN IN GOOGLE MAPS GPS
        </a>
      </div>

      <CitizenChatbot lat={userLocation[0]} lng={userLocation[1]} activeBasinName={activeBasin.name} surgeHeight={surgeHeight} />
    </div>
  );
};

export default NavigationRoute;
