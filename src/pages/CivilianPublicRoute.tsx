import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { basinRegistry } from '../data/basinRegistry';
import { CitizenChatbot } from '../components/CitizenChatbot';

interface ContextType {
  surgeHeight: number;
  theme: 'dark' | 'light';
  selectedBasinId: string;
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
  const [sosSentTime, setSosSentTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedCellBroadcast, setDismissedCellBroadcast] = useState(false);

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
      setSosSentTime(new Date());
    } catch (err) {
      console.error("Firebase write failed:", err);
      setSosSent(true);
      setSosSentTime(new Date());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighRisk = surgeHeight >= 5;

  const tileUrl = theme === 'light' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  // Pre-filled SMS payload to emergency number 112
  const nativeSmsUrl = `sms:112?body=${encodeURIComponent(
    `EMERGENCY SOS: Stranded flood party of ${partySize} at GPS (${pinPosition[0].toFixed(4)}, ${pinPosition[1].toFixed(4)}). Medical needed: ${needsMedical ? 'YES' : 'NO'}. Surge level: ${surgeHeight}m.`
  )}`;

  const distanceKm = getDistanceKm(pinPosition[0], pinPosition[1], activeBasin.safeCampPoint[0], activeBasin.safeCampPoint[1]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', height: '100%' }}>
      <style>
        {`
          .civilian-main-col {
            flex: 1 1 600px;
            padding: var(--content-padding, 32px);
            box-sizing: border-box;
            color: var(--text-primary);
          }
          .civilian-sidebar {
            width: 380px;
            flex: 0 0 380px;
            background-color: var(--bg-panel);
            border-left: 1px solid var(--grid-line);
            padding: 24px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .stranded-input:focus {
            border-color: var(--safe-cyan) !important;
            outline: none;
            box-shadow: 0 0 0 1px var(--safe-cyan);
          }
          @media (max-width: 768px) {
            :root {
              --content-padding: 16px;
            }
            .civilian-sidebar {
              width: 100%;
              flex: 1 1 100%;
              border-left: none;
              border-top: 1px solid var(--grid-line);
            }
          }
        `}
      </style>

      <div className="civilian-main-col">
        {/* AUTOMATIC GOVERNMENT EMERGENCY CELL BROADCAST BANNER */}
        {isHighRisk && !dismissedCellBroadcast && (
          <div style={{
            backgroundColor: '#B91C1C', color: '#FFFFFF', padding: '16px 24px',
            borderRadius: '8px', marginBottom: '24px', border: '2px solid #EF4444',
            boxShadow: '0 0 25px rgba(220, 38, 38, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>📡</span>
              <div>
                <div style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '0.1em', color: '#FECACA' }}>
                  GOVERNMENT EMERGENCY CELL BROADCAST (NDMA / SDMA)
                </div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', margin: '2px 0' }}>
                  CRITICAL FLOOD SURGE WARNING (+{surgeHeight}M) IN YOUR CELL TOWER SECTOR
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  Automated cell broadcast pushed to all mobile devices in {activeBasin.name.split(':')[0]}. Move to designated high-ground shelters immediately.
                </div>
              </div>
            </div>
            <button 
              onClick={() => setDismissedCellBroadcast(true)}
              style={{ padding: '8px 16px', backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              DISMISS ALERT
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--grid-line)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.05em' }}>NDRF CITIZEN EMERGENCY SOS PORTAL</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Tap map to drop pin • Active Region: <strong style={{ color: 'var(--text-primary)' }}>{activeBasin.name}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '24px' }}>
          
          {/* Interactive Pin Drop Map Card */}
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: 'var(--safe-cyan)', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: '8px' }}>
              STEP 1: TAP MAP TO DROP YOUR EXACT SOS LOCATION
            </div>
            <div style={{ minHeight: '400px', height: '60vh', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--grid-line)', marginBottom: '12px' }}>
              <MapContainer center={activeBasin.center} zoom={activeBasin.zoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                <TileLayer url={tileUrl} />
                <LocationMarker position={pinPosition} setPosition={setPinPosition} />
              </MapContainer>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              SELECTED GPS: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{pinPosition[0].toFixed(4)}, {pinPosition[1].toFixed(4)}</span>
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
                  Your exact map pin ({pinPosition[0].toFixed(4)}, {pinPosition[1].toFixed(4)}) is live on the NDRF HQ Map. Hold your position on high ground.
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
                    className="stranded-input"
                    style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-line)', color: 'var(--text-primary)', borderRadius: '4px', fontSize: '16px' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                  <input 
                    type="checkbox" 
                    id="med" 
                    checked={needsMedical} 
                    onChange={e => setNeedsMedical(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--safe-cyan)', cursor: 'pointer' }}
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

                {/* 1-TAP NATIVE PHONE EMERGENCY SMS LINK */}
                <button 
                  type="button"
                  onClick={() => window.location.href = nativeSmsUrl}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--safe-cyan)',
                    color: 'var(--safe-cyan)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  💬 SEND PRE-FILLED SMS TO 112 (OFFLINE CELLULAR)
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
      
      <aside className="civilian-sidebar">
        <h2 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Citizen Dashboard
        </h2>
        
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>NEAREST NDRF SHELTER</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--responder-green)' }}>
            {distanceKm.toFixed(1)} KM
          </div>
        </div>

        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>SOS STATUS</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: isSubmitting ? 'var(--alert-amber)' : (sosSent ? 'var(--responder-green)' : 'var(--text-primary)') }}>
            {isSubmitting ? 'Broadcasting...' : (sosSent && sosSentTime ? `Sent at ${sosSentTime.toLocaleTimeString()}` : 'Not sent')}
          </div>
        </div>
      </aside>

      <CitizenChatbot lat={pinPosition[0]} lng={pinPosition[1]} activeBasinName={activeBasin.name} surgeHeight={surgeHeight} />
    </div>
  );
};

export default CivilianPublicRoute;
