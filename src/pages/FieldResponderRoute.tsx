import React from 'react';
import { useOutletContext } from 'react-router-dom';
import CommandMap from '../components/CommandMap';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ContextType {
  surgeHeight: number;
  pings: any[];
  setStrandedPop: (val: number) => void;
  theme: 'dark' | 'light';
}

const FieldResponderRoute: React.FC = () => {
  const { surgeHeight, pings, setStrandedPop, theme } = useOutletContext<ContextType>();

  const sendPing = async (status: 'SAFE' | 'STRANDED') => {
    try {
      await addDoc(collection(db, 'responderStatus'), {
        id: `Unit-${Math.floor(Math.random() * 900) + 100}`,
        status,
        lat: 26.75 + Math.random() * 0.2, // Brahmaputra region
        lng: 94.05 + Math.random() * 0.2,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("Firebase write failed. Did you add config?", e);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CommandMap surgeHeight={surgeHeight} pings={pings} setStrandedPop={setStrandedPop} theme={theme} />
      
      {/* Top Left Label */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 1000, 
        backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '8px 16px',
        border: '1px solid var(--responder-green)', borderRadius: '4px',
        color: 'var(--responder-green)', fontWeight: 'bold', letterSpacing: '0.05em'
      }}>
        FIELD RESPONDER VIEW
      </div>

      {/* Bottom Ping Controls */}
      <div style={{
        position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center',
        backgroundColor: 'var(--bg-panel)', padding: '16px', borderRadius: '8px',
        border: '1px solid var(--grid-line)', width: '90%', maxWidth: '400px'
      }}>
        <button 
          onClick={() => sendPing('SAFE')}
          style={{ backgroundColor: 'var(--responder-green)', color: '#000', border: 'none', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
        >
          MARK SAFE
        </button>
        <button 
          onClick={() => sendPing('STRANDED')}
          style={{ backgroundColor: 'var(--responder-red)', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}
        >
          MARK STRANDED
        </button>
      </div>
    </div>
  );
};

export default FieldResponderRoute;
