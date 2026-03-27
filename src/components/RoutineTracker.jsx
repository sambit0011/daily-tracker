import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, Clock, X, ChevronDown, Edit2, Check } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
const periods = ['AM', 'PM'];

const TimePickerModal = ({ isOpen, onClose, onSelect, initialTime }) => {
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
        setP(period);
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

const RoutineTracker = ({ data, setData }) => {
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('07:00 AM');
  const [newTask, setNewTask] = useState('');
  const [showCopySelector, setShowCopySelector] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const routines = data.routines || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  const sortRoutine = (routine) => {
    return [...routine].sort((a, b) => {
      const timeToMinutes = (t) => {
        const [time, period] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
  };

  const handleSaveActivity = (e) => {
    if (e) e.preventDefault();
    if (!newTask) return;

    let updatedDayRoutine;
    if (editingId) {
      updatedDayRoutine = routines[selectedDay].map(a => 
        a.id === editingId ? { ...a, time: currentTime, task: newTask } : a
      );
      setEditingId(null);
    } else {
      const newActivity = { time: currentTime, task: newTask, id: Date.now() };
      updatedDayRoutine = [...(routines[selectedDay] || []), newActivity];
    }
    
    updatedDayRoutine = sortRoutine(updatedDayRoutine);

    setData(prev => ({
      ...prev,
      routines: { ...routines, [selectedDay]: updatedDayRoutine }
    }));
    setNewTask('');
    setCurrentTime('07:00 AM');
  };

  const startEdit = (activity) => {
    setEditingId(activity.id);
    setCurrentTime(activity.time);
    setNewTask(activity.task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCurrentTime('07:00 AM');
    setNewTask('');
  };

  const deleteActivity = (id) => {
    const updatedDayRoutine = routines[selectedDay].filter(a => a.id !== id);
    setData(prev => ({
      ...prev,
      routines: { ...routines, [selectedDay]: updatedDayRoutine }
    }));
    if (editingId === id) cancelEdit();
  };

  const copyFromDay = (fromDay) => {
    const sourceRoutine = routines[fromDay];
    setData(prev => ({
      ...prev,
      routines: {
        ...routines,
        [selectedDay]: sortRoutine([...sourceRoutine.map(a => ({ ...a, id: Math.random() }))])
      }
    }));
    setShowCopySelector(false);
  };

  const currentRoutine = routines[selectedDay] || [];

  return (
    <div className="routine-view animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Routine</h1>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowCopySelector(!showCopySelector)} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}>
            Copy options <ChevronDown size={14} />
          </button>
          {showCopySelector && (
            <div className="glass-card animate-in" style={{ position: 'absolute', top: '45px', right: 0, zIndex: 100, width: '200px', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Copy routine from:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {days.filter(d => d !== selectedDay).map(day => (
                  <button key={day} onClick={() => copyFromDay(day)} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', fontSize: '11px', flex: '1 0 30%' }}>{day}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="subtitle">Design your weekly flow</p>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
        {days.map(day => (
          <button key={day} onClick={() => { setSelectedDay(day); cancelEdit(); }} style={{ background: selectedDay === day ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', whiteSpace: 'nowrap' }}>{day}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px', border: editingId ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>{editingId ? 'Edit Activity' : `What's next for ${selectedDay}?`}</h3>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div onClick={() => setShowTimePicker(true)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--card-border)' }}>
            <Clock size={16} style={{ color: 'var(--accent-blue)', marginBottom: '4px' }} />
            <span style={{ fontSize: '16px', fontWeight: '700' }}>{currentTime}</span>
          </div>

          <div style={{ flex: 2 }}>
            <input type="text" placeholder="Activity name..." value={newTask} onChange={(e) => setNewTask(e.target.value)} style={{ padding: '15px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSaveActivity} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
            {editingId ? <Check size={20} /> : <Plus size={20} />} {editingId ? 'Save Changes' : 'Add to Schedule'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '14px' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {currentRoutine.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
            <Clock size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <p>Your {selectedDay} is currently empty.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            <div style={{ position: 'absolute', left: '0', top: '10px', bottom: '10px', width: '1px', background: 'linear-gradient(to bottom, var(--accent-blue), transparent)' }}></div>

            {currentRoutine.map((item, i) => (
              <div key={item.id} className="animate-in" style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)', marginTop: '8px', marginLeft: '-24px', boxShadow: '0 0 10px var(--accent-blue)' }}></div>
                <div className="glass-card" style={{ flex: 1, marginBottom: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: editingId === item.id ? '1px solid var(--accent-blue)' : '1px solid var(--card-border)' }}>
                  <div onClick={() => startEdit(item)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '4px' }}>{item.time}</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{item.task}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Edit2 size={16} style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => startEdit(item)} />
                    <Trash2 size={16} className="text-red-500" style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => deleteActivity(item.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TimePickerModal isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} onSelect={(time) => { setCurrentTime(time); setShowTimePicker(false); }} initialTime={currentTime} />
    </div>
  );
};

export default RoutineTracker;
