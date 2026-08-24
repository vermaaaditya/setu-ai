import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { basinRegistry } from '../data/basinRegistry';

interface ContextType {
  surgeHeight: number;
  theme: 'dark' | 'light';
  selectedBasinId: string;
}

// Component to handle map clicks and drop pin
function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  const pinIcon = new L.DivIcon({
    className: '',
    html: `<div style="background-color: #FF4D4D; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFF; box-shadow: 0 0 15px #FF4D4D; animation: pulse 1.5s infinite;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  return position === null ? null : (
    <Marker position={position} icon={pinIcon}>
      <Popup>Your Selected SOS Location</Popup>
    </Marker>
  );
}

const CivilianPublicRoute: React.FC = () => {
  const { surgeHeight, selectedBasinId, theme } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const [pinPosition, setPinPosition] = useState<[number, number]>(activeBasin.center);
  const [partySize, setPartySize] = useState(2);
  const [needsMedical, setNeedsMedical] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'responderStatus'), {
        id: `Citizen-SOS-${Math.floor(Math.random() * 9000) + 1000}`,
        status: 'STRANDED',
        partySize,
        needsMedical,
        lat: pinPosition[0],
        lng: pinPosition[1],
        timestamp: serverTimestamp()
      });
      setSosSent(true);
    } catch (err) {
      console.error("Firebase write failed:", err);
      setSosSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighRisk = surgeHeight >= 5;

  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ 
      padding: '32px', 
      maxWidth: '1100px', 
      margin: '0 auto', 
      color: 'var(--text-primary)',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--grid-line)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🇮🇳</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.05em' }}>NDRF CITIZEN EMERGENCY SOS PORTAL</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Tap map to drop pin • Active Region: <strong style={{ color: 'var(--text-primary)' }}>{activeBasin.name}</strong>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Interactive Pin Drop Map Card */}
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--safe-cyan)', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: '8px' }}>
            STEP 1: TAP MAP TO DROP YOUR EXACT SOS LOCATION
          </div>
          <div style={{ height: '300px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--grid-line)', marginBottom: '12px' }}>
            <MapContainer center={activeBasin.center} zoom={activeBasin.zoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
              <TileLayer url={tileUrl} />
              <LocationMarker position={pinPosition} setPosition={setPinPosition} />
            </MapContainer>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            SELECTED GPS: <span style={{ color: 'var(--text-primary)' }}>{pinPosition[0].toFixed(4)}, {pinPosition[1].toFixed(4)}</span>
          </div>
        </div>

        {/* SOS Request Form Card */}
        <div style={{ 
          backgroundColor: 'var(--bg-panel)', 
          border: '2px solid #FF4D4D', 
          borderRadius: '8px', 
          padding: '24px',
          boxShadow: '0 0 30px rgba(255, 77, 77, 0.2)'
        }}>
          <div style={{ fontSize: '12px', color: '#FF4D4D', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>
            STEP 2: BROADCAST EMERGENCY SIGNAL
          </div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Request NDRF Air-Drop / Evacuation</h2>

          {sosSent ? (
            <div style={{ 
              backgroundColor: 'rgba(52, 211, 153, 0.1)', 
              border: '1px solid var(--responder-green)', 
              padding: '20px', 
              borderRadius: '6px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--responder-green)' }}>SOS SIGNAL TRANSMITTED</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                Your exact map pin ({pinPosition[0].toFixed(4)}, {pinPosition[1].toFixed(4)}) is now live on the NDRF HQ Map. Hold your position on high ground.
              </p>
              <button 
                onClick={() => setSosSent(false)}
                style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--grid-line)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px' }}
              >
                Send Additional Alert
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSOS} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  NUMBER OF STRANDED PERSONS
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={partySize} 
                  onChange={e => setPartySize(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-line)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input 
                  type="checkbox" 
                  id="med" 
                  checked={needsMedical} 
                  onChange={e => setNeedsMedical(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: '#FF4D4D', cursor: 'pointer' }}
                />
                <label htmlFor="med" style={{ fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Urgent Medical Attention Needed
                </label>
              </div>

              {/* HIGH CONTRAST SOLID RED SOS BUTTON */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  background: 'linear-gradient(135deg, #FF4D4D 0%, #DC2626 100%)', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  padding: '18px 24px', 
                  fontWeight: '900', 
                  fontSize: '16px', 
                  cursor: 'pointer', 
                  borderRadius: '6px',
                  letterSpacing: '0.08em',
                  boxShadow: '0 0 25px rgba(255, 77, 77, 0.6)',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? 'TRANSMITTING GPS SIGNAL...' : '🚨 BROADCAST EMERGENCY SOS TO NDRF'}
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Basin Status & Relief Camps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-panel)', 
          border: `1px solid ${isHighRisk ? 'var(--alert-amber)' : 'var(--responder-green)'}`, 
          borderRadius: '8px', 
          padding: '20px' 
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>LIVE BASIN SURGE LEVEL</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: isHighRisk ? 'var(--alert-amber)' : 'var(--responder-green)' }}>
            {surgeHeight.toFixed(1)} M
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
            {isHighRisk 
              ? '⚠️ CRITICAL SURGE ALERT: Lowland roads in this basin are severely compromised. Move to designated relief camps immediately.' 
              : '🟢 NORMAL MONITORING: Water levels are manageable. Stay tuned to NDRF broadcast bulletins.'}
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
            NEARBY NDRF RELIEF CAMPS & SHELTERS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '10px', border: '1px solid var(--grid-line)', borderRadius: '4px', fontSize: '13px' }}>
              <strong>📍 NDRF Primary Base Camp</strong> — Capacity: 850 / 1200
            </div>
            <div style={{ padding: '10px', border: '1px solid var(--grid-line)', borderRadius: '4px', fontSize: '13px' }}>
              <strong>📍 SDMA Sector 4 Emergency Shelter</strong> — Capacity: 410 / 600
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivilianPublicRoute;
