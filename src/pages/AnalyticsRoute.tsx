import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { basinRegistry } from '../data/basinRegistry';

interface ContextType {
  surgeHeight: number;
  pings: any[];
  strandedPop: number;
  selectedBasinId: string;
}

const AnalyticsRoute: React.FC = () => {
  const { pings, selectedBasinId } = useOutletContext<ContextType>();
  const activeBasin = basinRegistry[selectedBasinId] || basinRegistry['brahmaputra'];

  const roadCount = activeBasin.roads.features.length;
  const safeCount = pings.filter(p => p.status === 'SAFE').length;
  const strandedCount = pings.filter(p => p.status === 'STRANDED').length;

  const mockLogs = [
    { time: '12:44:10', type: 'FIREBASE', msg: `Received ${pings.length} live responder telemetry pings.` },
    { time: '12:42:05', type: 'AI_DISPATCH', msg: `Groq Llama model synthesized tactical warning manifest for ${activeBasin.name}.` },
    { time: '12:39:50', type: 'SPATIAL', msg: `Recalculated A* evacuation path matrix avoiding submerged corridors.` },
    { time: '12:35:12', type: 'SYSTEM', msg: `Basin switched to [${activeBasin.name}]. Map recentered to (${activeBasin.center[0]}, ${activeBasin.center[1]}).` }
  ];

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
      <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--grid-line)', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '0.05em' }}>NDRF MISSION CONTROL & AUDIT LOGS</h1>
        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>
          Real-time System Telemetry, Dispatch Audits & Spatial Metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', padding: '20px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ACTIVE DISASTER BASIN</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--safe-cyan)' }}>{activeBasin.name.split(':')[0]}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', padding: '20px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ROAD NETWORK EDGES</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{roadCount.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', padding: '20px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>VERIFIED SAFE RESPONDERS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--responder-green)' }}>{safeCount} UNITS</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', padding: '20px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>STRANDED SOS ALERTS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--alert-red)' }}>{strandedCount} ALERTS</div>
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--grid-line)', borderRadius: '8px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.05em' }}>LIVE INCIDENT CHRONOLOGY</h2>
          <span style={{ fontSize: '12px', color: 'var(--responder-green)' }}>● RECORDING LIVE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mockLogs.map((log, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              padding: '12px', 
              backgroundColor: 'var(--bg-base)', 
              borderRadius: '4px',
              border: '1px solid var(--grid-line)',
              fontFamily: 'monospace',
              fontSize: '13px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>[{log.time}]</span>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '3px', 
                fontSize: '11px', 
                fontWeight: 'bold',
                backgroundColor: log.type === 'FIREBASE' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                color: log.type === 'FIREBASE' ? 'var(--responder-green)' : 'var(--safe-cyan)'
              }}>
                {log.type}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsRoute;
