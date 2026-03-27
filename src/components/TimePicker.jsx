import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
const periods = ['AM', 'PM'];

const TimePicker = ({ isOpen, onClose, onSelect, initialTime }) => {
  const [h, setH] = useState(7);
  const [m, setM] = useState('00');
  const [p, setP] = useState('AM');

  useEffect(() => {
    if (isOpen && initialTime && initialTime.includes(' ') && initialTime.includes(':')) {
      try {
        const [time, period] = initialTime.split(' ');
        const [hour, min] = time.split(':');
        setH(parseInt(hour));
        setM(min);
        setP(period === '{p}' ? 'AM' : period);
      } catch (e) {
        console.error("Failed to parse time:", initialTime);
      }
    }
  }, [isOpen, initialTime]);

  if (!isOpen) return null;

  return (
    <div className="sidebar-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card animate-in" style={{ width: '90%', maxWidth: '320px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Select Time</h3>
          <X onClick={onClose} style={{ cursor: 'pointer', opacity: 0.6 }} />
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '24px',
          padding: '10px 0',
          position: 'relative',
          height: '200px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '10px', 
            right: '10px', 
            height: '44px', 
            background: 'rgba(59, 130, 246, 0.15)', 
            transform: 'translateY(-50%)',
            borderRadius: '12px',
            pointerEvents: 'none',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}></div>

          <div className="picker-column" style={{ height: '100%', overflowY: 'scroll', textAlign: 'center', width: '30%', padding: '78px 0', scrollbarWidth: 'none' }}>
            {hours.map(hour => (
              <div key={hour} onClick={() => setH(hour)} style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: h === hour ? '24px' : '18px', fontWeight: h === hour ? '700' : '400', color: h === hour ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                {hour}
              </div>
            ))}
          </div>

          <div className="picker-column" style={{ height: '100%', overflowY: 'scroll', textAlign: 'center', width: '30%', padding: '78px 0', scrollbarWidth: 'none' }}>
            {minutes.map(min => (
              <div key={min} onClick={() => setM(min)} style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: m === min ? '24px' : '18px', fontWeight: m === min ? '700' : '400', color: m === min ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                {min}
              </div>
            ))}
          </div>

          <div className="picker-column" style={{ height: '100%', overflowY: 'scroll', textAlign: 'center', width: '30%', padding: '78px 0', scrollbarWidth: 'none' }}>
            {periods.map(period => (
              <div key={period} onClick={() => setP(period)} style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: p === period ? '22px' : '18px', fontWeight: p === period ? '700' : '400', color: p === period ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                {period}
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Selected: <span style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>{h}:{m} {p}</span>
        </div>

        <button onClick={() => onSelect(`${h}:${m} ${p}`)} style={{ width: '100%', marginTop: '16px' }}>
          Confirm Time
        </button>
      </div>
    </div>
  );
};

export default TimePicker;
