import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommandMap from '../components/CommandMap';
import type { ResponderPing } from '../components/CommandLayout';
import { basinRegistry } from '../data/basinRegistry';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContextType {
  surgeHeight: number;
  pings: ResponderPing[];
  setStrandedPop: (val: number) => void;
  theme: 'dark' | 'light';
  selectedBasinId: string;
}

const FieldResponderRoute: React.FC = () => {
  const { surgeHeight, pings, setStrandedPop, theme, selectedBasinId } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const [dismissedAlert, setDismissedAlert] = useState(false);

  const sendPing = async (status: 'SAFE' | 'STRANDED') => {
    try {
      await addDoc(collection(db, 'responderStatus'), {
        id: `Unit-${Math.floor(Math.random() * 900) + 100}`,
        status,
        lat: activeBasin.center[0] + (Math.random() - 0.5) * 0.04,
        lng: activeBasin.center[1] + (Math.random() - 0.5) * 0.04,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Firebase write failed. Did you add config?", e);
    }
  };

  const isBreachActive = surgeHeight > 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CommandMap surgeHeight={surgeHeight} pings={pings} setStrandedPop={setStrandedPop} theme={theme} activeBasin={activeBasin} />
      
      {/* Top Left View Label */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 1000, 
        backgroundColor: 'rgba(52, 211, 153, 0.15)', padding: '8px 16px',
        border: '1px solid var(--responder-green)', borderRadius: '4px',
        color: 'var(--responder-green)', fontWeight: 'bold', letterSpacing: '0.05em'
      }}>
        FIELD RESPONDER VIEW
      </div>

      {/* FLASHING RESPONDER BREACH ALERT BANNER */}
      {isBreachActive && !dismissedAlert && (
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2000, width: '90%', maxWidth: '650px',
          backgroundColor: '#DC2626', color: '#FFFFFF', padding: '14px 20px',
          borderRadius: '8px', boxShadow: '0 0 30px rgba(220, 38, 38, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
          border: '2px solid #FF4D4D', animation: 'pulse 1.5s infinite'
        }}>
          <div>
            <div style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '0.08em', marginBottom: '2px' }}>
              🚨 CRITICAL ROAD BREACH ALERT (+{surgeHeight}M SURGE)
            </div>
            <div style={{ fontSize: '12px', opacity: 0.95 }}>
              Submerged road corridors detected in {activeBasin.name.split(':')[0]}. All field units maintain high-ground protocol.
            </div>
          </div>
          <button 
            onClick={() => setDismissedAlert(true)}
            style={{ padding: '6px 12px', backgroundColor: '#000', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}
          >
            ACKNOWLEDGE
          </button>
        </div>
      )}

      {/* Bottom Ping Controls */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
        backgroundColor: 'var(--bg-panel)', padding: '16px', borderRadius: '8px',
        border: '1px solid var(--grid-line)', width: '90%', maxWidth: '440px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <button 
          onClick={() => sendPing('SAFE')}
          style={{ backgroundColor: 'var(--responder-green)', color: '#000', border: 'none', padding: '14px 28px', fontWeight: '900', cursor: 'pointer', borderRadius: '6px', fontSize: '15px', letterSpacing: '0.05em' }}
        >
          🟢 MARK SAFE
        </button>
        <button 
          onClick={() => sendPing('STRANDED')}
          style={{ backgroundColor: 'var(--responder-red)', color: '#fff', border: 'none', padding: '14px 28px', fontWeight: '900', cursor: 'pointer', borderRadius: '6px', fontSize: '15px', letterSpacing: '0.05em' }}
        >
          🔴 MARK STRANDED
        </button>
      </div>
    </div>
  );
};

export default FieldResponderRoute;
