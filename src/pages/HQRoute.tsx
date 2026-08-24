import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommandMap from '../components/CommandMap';
import { exportFloodZonesToKML } from '../lib/exportUtils';
import { calculateImpact } from '../lib/spatialEngine';
import { basinRegistry } from '../data/basinRegistry';

interface ContextType {
  surgeHeight: number;
  pings: any[];
  theme: 'dark' | 'light';
  selectedBasinId: string;
}

const HQRoute: React.FC = () => {
  const { surgeHeight, pings, theme, selectedBasinId } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const { floodedPolygons } = useMemo(() => {
    return calculateImpact(surgeHeight, activeBasin.elevationPolygons, activeBasin.roads as any, activeBasin.populationData as any);
  }, [surgeHeight, activeBasin]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CommandMap surgeHeight={surgeHeight} pings={pings} theme={theme} activeBasin={activeBasin} />
      
      {/* Absolute positioned HQ label over map */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 1000, 
        backgroundColor: 'var(--bg-panel)', padding: '8px 16px',
        border: '1px solid var(--grid-line)', borderRadius: '4px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          HQ COMMAND AREA: {activeBasin.name}
        </div>
        <button 
          onClick={() => exportFloodZonesToKML(floodedPolygons, surgeHeight)}
          style={{ padding: '4px 8px', backgroundColor: 'transparent', color: 'var(--safe-cyan)', border: '1px solid var(--safe-cyan)', cursor: 'pointer', fontSize: '12px' }}
        >
          EXPORT FLOOD ZONES (KML)
        </button>
      </div>
    </div>
  );
};

export default HQRoute;
