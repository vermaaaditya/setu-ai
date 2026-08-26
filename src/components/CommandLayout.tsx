import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, limit, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generateDispatch, speakText, generateManifestPDF } from '../lib/aiDispatcher';
import { basinRegistry } from '../data/basinRegistry';
import styles from './CommandLayout.module.css';

export interface ResponderPing {
  id: string;
  status: 'SAFE' | 'STRANDED';
  timestamp: any;
  lat: number;
  lng: number;
  needsMedical?: boolean;
}

const CommandLayout: React.FC = () => {
  const location = useLocation();
  const [surgeHeight, setSurgeHeight] = useState<number>(0);
  const [pings, setPings] = useState<ResponderPing[]>([]);
  const [strandedPop, setStrandedPop] = useState(0);
  const [lang, setLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [isDispatching, setIsDispatching] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra');
  const [showSectorModal, setShowSectorModal] = useState(true);

  const handleResolvePing = async (pingId: string) => {
    try {
      await deleteDoc(doc(db, 'responderStatus', pingId));
    } catch (e) {
      console.warn("Firebase delete failed. Removing locally.");
      setPings(prev => prev.filter(p => p.id !== pingId));
    }
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    const text = await generateDispatch(surgeHeight, strandedPop, lang);
    speakText(text, lang);
    setIsDispatching(false);
  };

  const handleSurgeChange = async (newVal: number) => {
    setSurgeHeight(newVal);
    try {
      await setDoc(doc(db, 'commandState', 'global'), { surgeHeightInMeters: newVal }, { merge: true });
    } catch (e) {}
  };

  const handleBasinChange = async (newId: string) => {
    setSelectedBasinId(newId);
    try {
      await setDoc(doc(db, 'commandState', 'global'), { activeBasinId: newId }, { merge: true });
    } catch (e) {}
  };

  // Firebase Sync: Surge Height & Basin
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'commandState', 'global'), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.surgeHeightInMeters !== undefined) setSurgeHeight(data.surgeHeightInMeters);
          if (data.activeBasinId) setSelectedBasinId(data.activeBasinId);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firebase not configured yet.");
    }
  }, []);

  // Firebase Sync: Responder Pings
  useEffect(() => {
    try {
      const q = query(collection(db, 'responderStatus'), orderBy('timestamp', 'desc'), limit(10));
      const unsub = onSnapshot(q, (snapshot) => {
        const loadedPings: ResponderPing[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          let parsedUnitId = data.id || '';
          if (!parsedUnitId.startsWith('Unit-') && !parsedUnitId.startsWith('Citizen-')) {
            parsedUnitId = `Unit ${doc.id.substring(0, 4).toUpperCase()}`;
          }
          loadedPings.push({ ...data, id: doc.id, docId: doc.id, unitId: parsedUnitId } as any);
        });
        setPings(loadedPings);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firebase not configured yet.");
    }
  }, []);

  return (
    <div className={`${styles.layout} ${theme === 'light' ? 'light-theme' : ''}`}>
      <nav className={styles.leftRail}>
        <NavLink to="/hq" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <div className={styles.navIcon}>HQ</div>
          <span className={styles.navLabel}>HQ Command</span>
        </NavLink>
        <NavLink to="/responder" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <div className={styles.navIcon}>FR</div>
          <span className={styles.navLabel}>Field Responder</span>
        </NavLink>
        <NavLink to="/civilian" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <div className={styles.navIcon}>SOS</div>
          <span className={styles.navLabel}>Citizen SOS</span>
        </NavLink>
        <NavLink to="/navigation" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <div className={styles.navIcon}>NAV</div>
          <span className={styles.navLabel}>Evac Nav</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <div className={styles.navIcon}>LOG</div>
          <span className={styles.navLabel}>Analytics & Logs</span>
        </NavLink>
        <div style={{ marginTop: 'auto', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', cursor: 'pointer' }}
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main className={styles.mapCanvas}>
        {/* Pass down everything needed by the map */}
        <Outlet context={{ surgeHeight, pings, setStrandedPop, theme, selectedBasinId }} />
      </main>

      {location.pathname === '/hq' && (
        <aside className={styles.telemetryPanel}>
        <h2 style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Live Telemetry
        </h2>
        
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>SURGE SIMULATOR</span>
            <span style={{ color: 'var(--alert-amber)' }}>{surgeHeight}M</span>
          </div>
          <input 
            type="range" 
            min="0" max="15" step="1" 
            value={surgeHeight} 
            onChange={e => handleSurgeChange(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* BASIN SELECTOR */}
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ACTIVE DISASTER SECTOR</div>
            <button 
              onClick={() => setShowSectorModal(true)}
              style={{ padding: '2px 8px', backgroundColor: 'rgba(0, 240, 255, 0.15)', color: 'var(--safe-cyan)', border: '1px solid var(--safe-cyan)', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
            >
              ⚡ SWITCH
            </button>
          </div>
          <select 
            value={selectedBasinId} 
            onChange={(e) => handleBasinChange(e.target.value)}
            style={{ width: '100%', padding: '8px', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--grid-line)' }}
          >
            {Object.values(basinRegistry).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>STRANDED POPULATION (EST)</div>
          <div className="data-value" style={{ fontSize: '20px', color: 'var(--responder-red)' }}>{strandedPop.toLocaleString()}</div>
        </div>
        
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>RESPONDER PINGS</div>
          <div className="data-value" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {pings.length === 0 ? "Listening for field pings..." : null}
            {pings.map(ping => (
              <div key={ping.id} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  [{new Date(ping.timestamp?.seconds * 1000).toLocaleTimeString() || 'LIVE'}] {(ping as any).unitName || (ping as any).unitId}{' '}
                  <span style={{ color: ping.status === 'SAFE' ? 'var(--responder-green)' : 'var(--responder-red)', fontWeight: 'bold' }}>
                    {ping.status}
                  </span>
                  {ping.needsMedical && (
                    <div style={{ color: '#D946EF', fontWeight: 'bold', fontSize: '11px', marginTop: '4px' }}>
                      ⚠️ Urgent medical service needed
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleResolvePing((ping as any).docId || ping.id)}
                  style={{ padding: '2px 6px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: 'var(--responder-green)', border: '1px solid var(--responder-green)', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                  title="Mark Rescued / Clear Signal"
                >
                  RESOLVED ✓
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI DISPATCH ACTIONS (Brick 10) */}
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>AI DISPATCH ACTIONS</div>
          
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as 'en-US' | 'hi-IN')}
            style={{ padding: '8px', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--grid-line)' }}
          >
            <option value="en-US">English (en-US)</option>
            <option value="hi-IN">Hindi (hi-IN)</option>
          </select>

          <button 
            onClick={handleDispatch}
            disabled={isDispatching}
            style={{ padding: '8px', backgroundColor: 'var(--safe-cyan)', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isDispatching ? 'GENERATING...' : 'GENERATE & SPEAK DISPATCH'}
          </button>

          <button 
            onClick={() => generateManifestPDF(surgeHeight, strandedPop)}
            style={{ padding: '8px', backgroundColor: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--safe-cyan)', cursor: 'pointer' }}
          >
            DOWNLOAD PDF MANIFEST
          </button>
        </div>
        </aside>
      )}

      {/* NATIONAL DISASTER SECTOR SELECTION MODAL */}
      {showSectorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          backgroundColor: 'rgba(5, 10, 20, 0.92)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-panel)', border: '2px solid var(--safe-cyan)',
            borderRadius: '12px', padding: '32px', maxWidth: '800px', width: '100%',
            boxShadow: '0 0 50px rgba(0, 240, 255, 0.3)', color: 'var(--text-primary)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.08em', color: 'var(--safe-cyan)', fontWeight: '900' }}>
                NATIONAL DISASTER COMMAND CENTER
              </h2>
              <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                Select an active flood crisis sector to initialize live tactical telemetry
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {Object.values(basinRegistry).map(basin => (
                <div 
                  key={basin.id}
                  onClick={() => {
                    handleBasinChange(basin.id);
                    setShowSectorModal(false);
                  }}
                  style={{
                    backgroundColor: selectedBasinId === basin.id ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-base)',
                    border: `2px solid ${selectedBasinId === basin.id ? 'var(--safe-cyan)' : 'var(--grid-line)'}`,
                    borderRadius: '8px', padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s ease', textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--safe-cyan)', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    CRISIS SECTOR
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {basin.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    GPS: {basin.center[0].toFixed(2)}, {basin.center[1].toFixed(2)}
                  </div>
                  <button 
                    style={{
                      width: '100%', padding: '10px',
                      backgroundColor: 'var(--safe-cyan)', color: '#000', border: 'none',
                      borderRadius: '4px', fontWeight: '900', fontSize: '12px', cursor: 'pointer',
                      letterSpacing: '0.05em'
                    }}
                  >
                    INITIALIZE COMMAND →
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setShowSectorModal(false)}
                style={{ padding: '8px 20px', backgroundColor: 'transparent', border: '1px solid var(--grid-line)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}
              >
                Skip / Continue with Current Sector ({basinRegistry[selectedBasinId]?.name.split(':')[0]})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandLayout;
