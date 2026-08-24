import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { doc, onSnapshot, setDoc, collection, query, orderBy, limit, Timestamp } from 'firebase/firestore';
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
}

const CommandLayout: React.FC = () => {
  const [booted, setBooted] = useState(false);
  const [surgeHeight, setSurgeHeight] = useState<number>(0);
  const [pings, setPings] = useState<ResponderPing[]>([]);
  const [strandedPop, setStrandedPop] = useState(0);
  const [lang, setLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [isDispatching, setIsDispatching] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedBasinId, setSelectedBasinId] = useState('brahmaputra');

  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const handleDispatch = async () => {
    setIsDispatching(true);
    const text = await generateDispatch(surgeHeight, strandedPop, lang);
    speakText(text, lang);
    setIsDispatching(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Firebase Sync: Surge Height
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'commandState', 'global'), (docSnap) => {
        if (docSnap.exists()) {
          setSurgeHeight(docSnap.data().surgeHeightInMeters || 0);
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
          loadedPings.push({ id: doc.id, ...doc.data() } as ResponderPing);
        });
        setPings(loadedPings);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firebase not configured yet.");
    }
  }, []);

  const handleSliderChange = (val: number) => {
    setSurgeHeight(val);
    try {
      setDoc(doc(db, 'commandState', 'global'), { surgeHeightInMeters: val }, { merge: true });
    } catch (e) {}
  };

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
            onChange={e => setSurgeHeight(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* BASIN SELECTOR */}
        <div style={{ border: '1px solid var(--grid-line)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>ACTIVE BASIN</div>
          <select 
            value={selectedBasinId} 
            onChange={(e) => setSelectedBasinId(e.target.value)}
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
              <div key={ping.id} style={{ marginBottom: '8px' }}>
                [{new Date(ping.timestamp?.seconds * 1000).toLocaleTimeString() || 'LIVE'}] {ping.id}{' '}
                <span style={{ color: ping.status === 'SAFE' ? 'var(--responder-green)' : 'var(--responder-red)' }}>
                  {ping.status}
                </span>
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
    </div>
  );
};

export default CommandLayout;
