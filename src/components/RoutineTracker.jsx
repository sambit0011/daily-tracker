import React, { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const RoutineTracker = ({ data, setData }) => {
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [newTime, setNewTime] = useState('');
  const [newTask, setNewTask] = useState('');
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  // Initialize routines if not exists
  const routines = data.routines || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  const addActivity = (e) => {
    e.preventDefault();
    if (!newTime || !newTask) return;

    const newActivity = { time: newTime, task: newTask, id: Date.now() };
    const updatedDayRoutine = [...(routines[selectedDay] || []), newActivity].sort((a, b) => a.time.localeCompare(b.time));
    
    setData(prev => ({
      ...prev,
      routines: {
        ...routines,
        [selectedDay]: updatedDayRoutine
      }
    }));

    setNewTime('');
    setNewTask('');
  };

  const deleteActivity = (id) => {
    const updatedDayRoutine = routines[selectedDay].filter(a => a.id !== id);
    setData(prev => ({
      ...prev,
      routines: {
        ...routines,
        [selectedDay]: updatedDayRoutine
      }
    }));
  };

  const copyToDays = (targetDays) => {
    const sourceRoutine = routines[selectedDay];
    const newRoutines = { ...routines };
    
    targetDays.forEach(day => {
      newRoutines[day] = [...sourceRoutine.map(a => ({ ...a, id: Math.random() }))];
    });

    setData(prev => ({
      ...prev,
      routines: newRoutines
    }));
    setShowCopyMenu(false);
  };

  const currentRoutine = routines[selectedDay] || [];

  return (
    <div className="routine-view animate-in">
      <h1>Weekly Routine</h1>
      <p className="subtitle">Plan your perfect day, everyday</p>

      {/* Day Selector */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{ 
              background: selectedDay === day ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Add Activity Form */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Add to {selectedDay}'s Schedule</h3>
        <form onSubmit={addActivity} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="time" 
              value={newTime} 
              onChange={(e) => setNewTime(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <input 
              type="text" 
              placeholder="What will you do?" 
              value={newTask} 
              onChange={(e) => setNewTask(e.target.value)}
              style={{ flex: 2 }}
              required
            />
          </div>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Activity
          </button>
        </form>
      </div>

      {/* Daily List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px' }}>{selectedDay}'s Timetable</h3>
        {currentRoutine.length > 0 && (
          <button 
            onClick={() => setShowCopyMenu(!showCopyMenu)}
            style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Copy size={14} /> Copy to...
          </button>
        )}
      </div>

      {showCopyMenu && (
        <div className="glass-card animate-in" style={{ borderColor: 'var(--accent-blue)', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Copy this routine to:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {days.filter(d => d !== selectedDay).map(day => (
              <button 
                key={day}
                onClick={() => copyToDays([day])}
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '6px 12px', fontSize: '12px' }}
              >
                {day}
              </button>
            ))}
            <button 
              onClick={() => copyToDays(days.filter(d => d !== selectedDay))}
              style={{ width: '100%', marginTop: '8px', background: 'var(--accent-blue)', fontSize: '12px' }}
            >
              Copy to all other days
            </button>
          </div>
        </div>
      )}

      {currentRoutine.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          No activities scheduled for {selectedDay}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentRoutine.map((item) => (
            <div key={item.id} className="glass-card" style={{ marginBottom: 0, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                color: 'var(--accent-blue)', 
                fontWeight: '700', 
                fontSize: '14px', 
                minWidth: '65px',
                padding: '4px 8px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                {item.time}
              </div>
              <div style={{ flex: 1, fontWeight: '500' }}>{item.task}</div>
              <Trash2 
                size={18} 
                className="text-red-500" 
                style={{ cursor: 'pointer', opacity: 0.6 }} 
                onClick={() => deleteActivity(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutineTracker;
