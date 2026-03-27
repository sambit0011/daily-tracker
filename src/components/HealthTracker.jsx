import React from 'react';
import { Moon, Smile, Scale } from 'lucide-react';

const HealthTracker = ({ data, setData }) => {
  const setSleep = (val) => {
    setData(prev => ({ ...prev, sleep: val }));
  };

  const setMood = (m) => {
    setData(prev => ({ ...prev, mood: m }));
  };

  const moods = ['Great', 'Good', 'Neutral', 'Tired', 'Bad'];

  return (
    <div className="health-view">
      <h1>Health</h1>
      <p className="subtitle">Monitor your vital recovery metrics</p>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Moon className="text-purple-500" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sleep Duration</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{data.sleep} hrs</div>
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="12" 
          step="0.5" 
          value={data.sleep} 
          onChange={(e) => setSleep(parseFloat(e.target.value))}
          style={{ height: '32px' }}
        />
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Smile className="text-pink-500" />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Daily Mood</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>{data.mood}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {moods.map(m => (
            <button 
              key={m}
              onClick={() => setMood(m)}
              style={{ 
                flex: 1, 
                fontSize: '12px', 
                padding: '8px 4px',
                background: data.mood === m ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                whiteSpace: 'nowrap'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Scale className="text-green-500" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Weight</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>Not set</div>
          </div>
          <button style={{ padding: '8px 16px', fontSize: '14px' }}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;
