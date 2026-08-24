import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommandMap from '../components/CommandMap';
import { exportFloodZonesToKML } from '../lib/exportUtils';
import { calculateImpact } from '../lib/spatialEngine';
import { elevationGeoJSONData } from '../data/mockBasin';
import realRoadsData from '../data/realRoads.json';
import { populationGeoJSONData } from '../data/mockPopulation';

interface ContextType {
  surgeHeight: number;
  theme: 'dark' | 'light';
}

const HQRoute: React.FC = () => {
  const { surgeHeight, theme } = useOutletContext<ContextType>();

  const { floodedPolygons } = useMemo(() => {
    return calculateImpact(surgeHeight, elevationGeoJSONData, realRoadsData as any, populationGeoJSONData);
  }, [surgeHeight]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CommandMap surgeHeight={surgeHeight} theme={theme} />
      
      {/* Absolute positioned HQ label over map */}
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 1000, 
        backgroundColor: 'var(--bg-panel)', padding: '8px 16px',
        border: '1px solid var(--grid-line)', borderRadius: '4px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          HQ COMMAND AREA: ASSAM 2020 BRAHMAPUTRA BREACH
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
