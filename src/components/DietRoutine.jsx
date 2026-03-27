import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Clock, X, ChevronDown, Edit2, Check, Utensils } from 'lucide-react';
import TimePicker from './TimePicker';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mealTypes = ['Preworkout', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const DietRoutine = ({ data, setData }) => {
  const [selectedDay, setSelectedDay] = useState(days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('08:00 AM');
  const [newMeal, setNewMeal] = useState('');
  const [newMealType, setNewMealType] = useState('Breakfast');
  const [showCopySelector, setShowCopySelector] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const routines = data.routines || {};
  const dietRoutines = data.dietRoutines || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  // Automatically fetch time from routine when meal type changes
  useEffect(() => {
    if (!editingId && routines[selectedDay]) {
      const matchingActivity = routines[selectedDay].find(a => 
        a.task.toLowerCase().includes(newMealType.toLowerCase())
      );
      if (matchingActivity) {
        setCurrentTime(matchingActivity.time);
      }
    }
  }, [newMealType, selectedDay, routines, editingId]);

  const sortDiet = (diet) => {
    return [...diet].sort((a, b) => {
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

  const handleSaveMeal = (e) => {
    if (e) e.preventDefault();
    if (!newMeal) return;

    let updatedDayDiet;
    if (editingId) {
      updatedDayDiet = dietRoutines[selectedDay].map(m => 
        m.id === editingId ? { ...m, time: currentTime, meal: newMeal, type: newMealType } : m
      );
      setEditingId(null);
    } else {
      const mealEntry = { time: currentTime, meal: newMeal, type: newMealType, id: Date.now() };
      updatedDayDiet = [...(dietRoutines[selectedDay] || []), mealEntry];
    }
    
    updatedDayDiet = sortDiet(updatedDayDiet);

    setData(prev => ({
      ...prev,
      dietRoutines: { ...dietRoutines, [selectedDay]: updatedDayDiet }
    }));
    setNewMeal('');
    setCurrentTime('08:00 AM');
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setCurrentTime(entry.time);
    setNewMeal(entry.meal);
    setNewMealType(entry.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCurrentTime('08:00 AM');
    setNewMeal('');
  };

  const deleteMeal = (id) => {
    const updatedDayDiet = dietRoutines[selectedDay].filter(m => m.id !== id);
    setData(prev => ({
      ...prev,
      dietRoutines: { ...dietRoutines, [selectedDay]: updatedDayDiet }
    }));
    if (editingId === id) cancelEdit();
  };

  const copyFromDay = (fromDay) => {
    const sourceDiet = dietRoutines[fromDay];
    setData(prev => ({
      ...prev,
      dietRoutines: {
        ...dietRoutines,
        [selectedDay]: sortDiet([...sourceDiet.map(m => ({ ...m, id: Math.random() }))])
      }
    }));
    setShowCopySelector(false);
  };

  const currentDiet = dietRoutines[selectedDay] || [];

  return (
    <div className="diet-routine-view animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Diet Plan</h1>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowCopySelector(!showCopySelector)} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}>
            Copy options <ChevronDown size={14} />
          </button>
          {showCopySelector && (
            <div className="glass-card animate-in" style={{ position: 'absolute', top: '45px', right: 0, zIndex: 100, width: '200px', padding: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Copy diet from:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {days.filter(d => d !== selectedDay).map(day => (
                  <button key={day} onClick={() => copyFromDay(day)} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', fontSize: '11px', flex: '1 0 30%' }}>{day}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="subtitle">Your weekly nutrition chart</p>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
        {days.map(day => (
          <button key={day} onClick={() => { setSelectedDay(day); cancelEdit(); }} style={{ background: selectedDay === day ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', whiteSpace: 'nowrap' }}>{day}</button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px', border: editingId ? '1px solid var(--accent-orange)' : '1px solid var(--card-border)' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>{editingId ? 'Edit Meal' : `Plan ${selectedDay}'s meals`}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div onClick={() => setShowTimePicker(true)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--card-border)' }}>
              <Clock size={16} style={{ color: 'var(--accent-orange)', marginBottom: '4px' }} />
              <span style={{ fontSize: '16px', fontWeight: '700' }}>{currentTime}</span>
            </div>
            
            <select 
              value={newMealType} 
              onChange={(e) => setNewMealType(e.target.value)}
              style={{ flex: 1.5, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--card-border)', borderRadius: '16px', padding: '12px' }}
            >
              {mealTypes.map(type => <option key={type} value={type} style={{ background: '#1a1a1a' }}>{type}</option>)}
            </select>
          </div>

          <input 
            type="text" 
            placeholder="What's on the menu?" 
            value={newMeal} 
            onChange={(e) => setNewMeal(e.target.value)} 
            style={{ padding: '15px' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSaveMeal} style={{ flex: 2, background: 'var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}>
            {editingId ? <Check size={20} /> : <Plus size={20} />} {editingId ? 'Save Changes' : 'Add to Plan'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '14px' }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {currentDiet.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.5 }}>
            <Utensils size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <p>No meals planned for {selectedDay}.</p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '20px' }}>
            <div style={{ position: 'absolute', left: '0', top: '10px', bottom: '10px', width: '1px', background: 'linear-gradient(to bottom, var(--accent-orange), transparent)' }}></div>

            {currentDiet.map((item, i) => (
              <div key={item.id} className="animate-in" style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)', marginTop: '8px', marginLeft: '-24px', boxShadow: '0 0 10px var(--accent-orange)' }}></div>
                <div className="glass-card" style={{ flex: 1, marginBottom: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: editingId === item.id ? '1px solid var(--accent-orange)' : '1px solid var(--card-border)' }}>
                  <div onClick={() => startEdit(item)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-orange)', background: 'rgba(255, 114, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.type}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.time}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{item.meal}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Edit2 size={16} style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => startEdit(item)} />
                    <Trash2 size={16} className="text-red-500" style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => deleteMeal(item.id)} />
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

export default DietRoutine;
