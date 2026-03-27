import React, { useState } from 'react';
import { Plus, Coffee, GlassWater } from 'lucide-react';

const DietTracker = ({ data, setData }) => {
  const [calInput, setCalInput] = useState('');

  const addCalories = () => {
    const val = parseInt(calInput);
    if (!isNaN(val)) {
      setData(prev => ({ ...prev, calories: prev.calories + val }));
      setCalInput('');
    }
  };

  const addWater = () => {
    setData(prev => ({ ...prev, water: prev.water + 1 }));
  };

  return (
    <div className="diet-view">
      <h1>Diet</h1>
      <p className="subtitle">Track your nutrition and hydration</p>

      <div className="stat-grid">
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Coffee size={18} className="text-orange-500" />
            <span style={{ fontSize: '14px' }}>Calories</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{data.calories}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
             <input 
              type="number" 
              placeholder="kcal" 
              value={calInput} 
              onChange={(e) => setCalInput(e.target.value)} 
              style={{ padding: '8px' }}
            />
            <button onClick={addCalories} style={{ padding: '0 12px', marginTop: '8px' }}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <GlassWater size={18} className="text-cyan-500" />
            <span style={{ fontSize: '14px' }}>Water (Cups)</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{data.water} / 8</div>
          <button onClick={addWater} style={{ marginTop: '12px', width: '100%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>
            + Add Cup
          </button>
        </div>
      </div>

      <h3 style={{ marginTop: '24px' }}>Log Meals</h3>
      <div className="glass-card" style={{ marginTop: '12px' }}>
         <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>
           Log meals to track macros
         </div>
      </div>
    </div>
  );
};

export default DietTracker;
