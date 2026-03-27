import React, { useState } from 'react';
import { Plus, Footprints, Timer } from 'lucide-react';

const ActivityTracker = ({ data, setData }) => {
  const [stepInput, setStepInput] = useState('');

  const addSteps = () => {
    const val = parseInt(stepInput);
    if (!isNaN(val)) {
      setData(prev => ({ ...prev, steps: prev.steps + val }));
      setStepInput('');
    }
  };

  return (
    <div className="activity-view">
      <h1>Activity</h1>
      <p className="subtitle">Keep moving to reach your goals</p>

      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
            <Footprints className="text-blue-500" />
          </div>
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Steps Today</div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{data.steps.toLocaleString()}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="number" 
            placeholder="Add steps..." 
            value={stepInput} 
            onChange={(e) => setStepInput(e.target.value)} 
          />
          <button onClick={addSteps} style={{ padding: '0 16px', marginTop: '8px' }}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      <h3>Workouts</h3>
      <div className="glass-card" style={{ marginTop: '12px' }}>
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          <Timer size={48} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <div>No workouts recorded today</div>
          <button style={{ marginTop: '16px', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)' }}>
            Start New Workout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
