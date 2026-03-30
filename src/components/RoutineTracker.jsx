import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, Clock, X, ChevronDown, Edit2, Check, Calendar } from 'lucide-react';
import TimePicker from './TimePicker';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const RoutineTracker = ({ data, setData }) => {
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('07:00 AM');
  const [newTask, setNewTask] = useState('');
  const [showCopySelector, setShowCopySelector] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const routines = data.routines || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  const showNotification = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
      showNotification('Activity updated');
    } else {
      const newActivity = { time: currentTime, task: newTask, id: Date.now() };
      updatedDayRoutine = [...(routines[selectedDay] || []), newActivity];
      showNotification('Activity added');
    }
    
    updatedDayRoutine = sortRoutine(updatedDayRoutine);

    setData(prev => ({
      ...prev,
      routines: { ...(prev.routines || {}), [selectedDay]: updatedDayRoutine }
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
      routines: { ...(prev.routines || {}), [selectedDay]: updatedDayRoutine }
    }));
    if (editingId === id) cancelEdit();
    showNotification('Activity removed');
  };

  const copyFromDay = (fromDay) => {
    const sourceRoutine = routines[fromDay];
    if (!sourceRoutine || sourceRoutine.length === 0) {
      showNotification(`${fromDay} has no routine to copy`);
      return;
    }

    setData(prev => ({
      ...prev,
      routines: {
        ...(prev.routines || {}),
        [selectedDay]: sortRoutine([...sourceRoutine.map(a => ({ ...a, id: Date.now() + Math.random() }))])
      }
    }));
    setShowCopySelector(false);
    showNotification(`Copied from ${fromDay}`);
  };

  const clearDay = () => {
    if (window.confirm(`Are you sure you want to clear ${selectedDay}'s schedule?`)) {
      setData(prev => ({
        ...prev,
        routines: { ...(prev.routines || {}), [selectedDay]: [] }
      }));
      setShowCopySelector(false);
      showNotification('Schedule cleared');
    }
  };

  const currentRoutine = sortRoutine(routines[selectedDay] || []);

  return (
    <div className="routine-view animate-in">
      {showToast && <div className="toast-notification">{toastMsg}</div>}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Routine</h1>
        <button onClick={() => setShowCopySelector(true)} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}>
          <Copy size={14} /> Copy options
        </button>
      </div>
      <p className="subtitle">Design your weekly flow</p>

      {showCopySelector && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowCopySelector(false)}></div>
          <div className="bottom-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Copy Routine</h3>
              <X onClick={() => setShowCopySelector(false)} style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select source day to copy routine from to {selectedDay}:</p>
            <div className="copy-day-grid">
              {days.filter(d => d !== selectedDay).map(day => (
                <button key={day} onClick={() => copyFromDay(day)} className="copy-day-btn">
                  <Calendar size={20} />
                  <span>{day}</span>
                </button>
              ))}
            </div>
            <button onClick={clearDay} style={{ width: '100%', marginTop: '24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Trash2 size={18} /> Clear {selectedDay}'s Schedule
            </button>
          </div>
        </>
      )}

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

      <TimePicker isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} onSelect={(time) => { setCurrentTime(time); setShowTimePicker(false); }} initialTime={currentTime} />
    </div>
  );
};

export default RoutineTracker;
