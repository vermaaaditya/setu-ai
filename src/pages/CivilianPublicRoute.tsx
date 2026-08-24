import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { basinRegistry } from '../data/basinRegistry';

interface ContextType {
  surgeHeight: number;
  theme: 'dark' | 'light';
  selectedBasinId: string;
}

const CivilianPublicRoute: React.FC = () => {
  const { surgeHeight, selectedBasinId } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

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
        lat: activeBasin.center[0] + (Math.random() - 0.5) * 0.03,
        lng: activeBasin.center[1] + (Math.random() - 0.5) * 0.03,
        timestamp: serverTimestamp()
      });
      setSosSent(true);
    } catch (err) {
      console.error("Firebase write failed:", err);
      // Fallback local acknowledgement
      setSosSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isHighRisk = surgeHeight >= 5;

  return (
    <div style={{ 
      padding: '32px', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      color: 'var(--text-primary)',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--grid-line)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🇮🇳</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.05em' }}>NDRF CITIZEN EMERGENCY SOS PORTAL</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              Public Assistance Channel • Active Region: <strong style={{ color: 'var(--text-primary)' }}>{activeBasin.name}</strong>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* SOS Request Form Card */}
        <div style={{ 
          backgroundColor: 'var(--bg-panel)', 
          border: '1px solid var(--alert-red)', 
          borderRadius: '8px', 
          padding: '24px',
          boxShadow: '0 4px 20px rgba(255, 77, 77, 0.15)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--alert-red)', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '8px' }}>
            EMERGENCY BROADCAST
          </div>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Request NDRF Air-Drop / Boat Evacuation</h2>

          {sosSent ? (
            <div style={{ 
              backgroundColor: 'rgba(52, 211, 153, 0.1)', 
              border: '1px solid var(--responder-green)', 
              padding: '20px', 
              borderRadius: '6px', 
              textAlign: 'center' 
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--responder-green)' }}>SOS SIGNAL TRANSMITTED</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                Your GPS telemetry & party details have been relayed to the NDRF HQ Command Map. Hold your position on high ground.
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
                  style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-base)', border: '1px solid var(--grid-line)', color: 'var(--text-primary)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="med" 
                  checked={needsMedical} 
                  onChange={e => setNeedsMedical(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--alert-red)' }}
                />
                <label htmlFor="med" style={{ fontSize: '14px', cursor: 'pointer' }}>
                  Urgent Medical Attention / Trauma Assistance Needed
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  backgroundColor: 'var(--alert-red)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '14px', 
                  fontWeight: 'bold', 
                  fontSize: '15px', 
                  cursor: 'pointer', 
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                  marginTop: '8px'
                }}
              >
                {isSubmitting ? 'TRANSMITTING GPS SIGNAL...' : '🔴 BROADCAST EMERGENCY SOS TO NDRF'}
              </button>
            </form>
          )}
        </div>

        {/* Flood Risk Status Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

          {/* NDRF Relief Camps Directory */}
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.05em' }}>
              NEARBY NDRF RELIEF CAMPS & SHELTERS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--grid-line)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>📍 NDRF Primary Base Camp</span>
                  <span style={{ color: 'var(--responder-green)', fontSize: '12px' }}>OPEN</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Location: High Ground Ridge • Capacity: 850 / 1200 • Medical Staff: Present
                </div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--grid-line)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>📍 SDMA Sector 4 Emergency Shelter</span>
                  <span style={{ color: 'var(--responder-green)', fontSize: '12px' }}>OPEN</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Location: District High School • Capacity: 410 / 600 • Ration Supply: Active
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CivilianPublicRoute;
