import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Clock, X, ChevronDown, Edit2, Check, Utensils, Flame, Info, Calendar } from 'lucide-react';
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
  const [selectedMealForIngredients, setSelectedMealForIngredients] = useState(null);
  const [newIngredient, setNewIngredient] = useState({ name: '', protein: 0, carbs: 0, fat: 0 });
  const [editingIngredientId, setEditingIngredientId] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const routines = data.routines || {};
  const dietRoutines = data.dietRoutines || {
    Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
  };

  const showNotification = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
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
      showNotification('Meal updated');
    } else {
      const mealEntry = { time: currentTime, meal: newMeal, type: newMealType, id: Date.now() };
      updatedDayDiet = [...(dietRoutines[selectedDay] || []), mealEntry];
      showNotification('Meal added to plan');
    }
    
    updatedDayDiet = sortDiet(updatedDayDiet);

    setData(prev => ({
      ...prev,
      dietRoutines: { ...(prev.dietRoutines || {}), [selectedDay]: updatedDayDiet }
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
      dietRoutines: { ...(prev.dietRoutines || {}), [selectedDay]: updatedDayDiet }
    }));
    if (editingId === id) cancelEdit();
    showNotification('Meal removed');
  };

  const copyFromDay = (fromDay) => {
    const sourceDiet = dietRoutines[fromDay];
    if (!sourceDiet || sourceDiet.length === 0) {
      showNotification(`${fromDay} has no plan to copy`);
      return;
    }

    setData(prev => ({
      ...prev,
      dietRoutines: {
        ...(prev.dietRoutines || {}),
        [selectedDay]: sortDiet([...sourceDiet.map(m => ({ ...m, id: Date.now() + Math.random() }))])
      }
    }));
    setShowCopySelector(false);
    showNotification(`Copied from ${fromDay}`);
  };

  const clearDay = () => {
    if (window.confirm(`Are you sure you want to clear ${selectedDay}'s diet plan?`)) {
      setData(prev => ({
        ...prev,
        dietRoutines: { ...(prev.dietRoutines || {}), [selectedDay]: [] }
      }));
      setShowCopySelector(false);
      showNotification('Plan cleared');
    }
  };

  const calculateMacros = (ingredients = []) => {
    return ingredients.reduce((acc, ing) => {
      const p = parseFloat(ing.protein) || 0;
      const c = parseFloat(ing.carbs) || 0;
      const f = parseFloat(ing.fat) || 0;
      return {
        protein: acc.protein + p,
        carbs: acc.carbs + c,
        fat: acc.fat + f,
        calories: acc.calories + (p * 4) + (c * 4) + (f * 9)
      };
    }, { protein: 0, carbs: 0, fat: 0, calories: 0 });
  };

  const startEditIngredient = (ing) => {
    setEditingIngredientId(ing.id);
    setNewIngredient({
      name: ing.name,
      protein: ing.protein,
      carbs: ing.carbs,
      fat: ing.fat
    });
  };

  const cancelEditIngredient = () => {
    setEditingIngredientId(null);
    setNewIngredient({ name: '', protein: 0, carbs: 0, fat: 0 });
  };

  const addIngredient = () => {
    if (!newIngredient.name) return;
    setData(prev => {
      const currentDietRoutines = prev.dietRoutines || { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
      const updatedDayDiet = currentDietRoutines[selectedDay].map(m => {
        if (m.id === selectedMealForIngredients.id) {
          let ingredients;
          if (editingIngredientId) {
            ingredients = (m.ingredients || []).map(i => 
              i.id === editingIngredientId ? { ...newIngredient, id: i.id } : i
            );
          } else {
            ingredients = [...(m.ingredients || []), { ...newIngredient, id: Date.now() }];
          }
          return { ...m, ingredients };
        }
        return m;
      });
      return { ...prev, dietRoutines: { ...currentDietRoutines, [selectedDay]: updatedDayDiet } };
    });
    setNewIngredient({ name: '', protein: 0, carbs: 0, fat: 0 });
    setEditingIngredientId(null);
    if (editingIngredientId) showNotification('Ingredient updated');
  };

  const deleteIngredient = (ingredientId) => {
    setData(prev => {
      const currentDietRoutines = prev.dietRoutines || { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
      const updatedDayDiet = currentDietRoutines[selectedDay].map(m => {
        if (m.id === selectedMealForIngredients.id) {
          const ingredients = (m.ingredients || []).filter(i => i.id !== ingredientId);
          return { ...m, ingredients };
        }
        return m;
      });
      return { ...prev, dietRoutines: { ...currentDietRoutines, [selectedDay]: updatedDayDiet } };
    });
    if (editingIngredientId === ingredientId) cancelEditIngredient();
  };


  const currentDiet = sortDiet(dietRoutines[selectedDay] || []);
  const activeMeal = selectedMealForIngredients ? currentDiet.find(m => m.id === selectedMealForIngredients.id) : null;
  const mealMacros = activeMeal ? calculateMacros(activeMeal.ingredients) : { protein: 0, carbs: 0, fat: 0, calories: 0 };

  const dailyMacros = currentDiet.reduce((acc, meal) => {
    const macros = calculateMacros(meal.ingredients);
    return {
      protein: acc.protein + macros.protein,
      carbs: acc.carbs + macros.carbs,
      fat: acc.fat + macros.fat,
      calories: acc.calories + macros.calories
    };
  }, { protein: 0, carbs: 0, fat: 0, calories: 0 });

  return (
    <div className="diet-routine-view animate-in">
      {showToast && <div className="toast-notification">{toastMsg}</div>}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1>Diet Plan</h1>
        <button onClick={() => setShowCopySelector(true)} style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '12px' }}>
          <Copy size={14} /> Copy options
        </button>
      </div>
      <p className="subtitle">Your weekly nutrition chart</p>

      {showCopySelector && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowCopySelector(false)}></div>
          <div className="bottom-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Copy Diet Plan</h3>
              <X onClick={() => setShowCopySelector(false)} style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Select source day to copy diet from to {selectedDay}:</p>
            <div className="copy-day-grid">
              {days.filter(d => d !== selectedDay).map(day => (
                <button key={day} onClick={() => copyFromDay(day)} className="copy-day-btn">
                  <Calendar size={20} />
                  <span>{day}</span>
                </button>
              ))}
            </div>
            <button onClick={clearDay} style={{ width: '100%', marginTop: '24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Trash2 size={18} /> Clear {selectedDay}'s Plan
            </button>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
        {days.map(day => (
          <button key={day} onClick={() => { setSelectedDay(day); cancelEdit(); }} style={{ background: selectedDay === day ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', whiteSpace: 'nowrap' }}>{day}</button>
        ))}
      </div>

      <div className="glass-card" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '24px', padding: '16px 20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Daily Nutritional Summary ({selectedDay})</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '2px' }}>Total Calories</div>
            <div style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={20} style={{ color: 'var(--accent-orange)' }} /> {Math.round(dailyMacros.calories)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>Protein</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(dailyMacros.protein)}g</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>Carbs</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(dailyMacros.carbs)}g</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>Fats</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(dailyMacros.fat)}g</div>
            </div>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: '16px', height: '6px', background: 'rgba(255,255,255,0.03)' }}>
          <div className="progress-fill" style={{ width: `${Math.min(100, (dailyMacros.calories / 2500) * 100)}%`, background: 'var(--accent-blue)', height: '100%' }}></div>
        </div>
        <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '8px', textAlign: 'right' }}>Target: 2500 kcal</div>
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

            {currentDiet.map((item, i) => {
              const macros = calculateMacros(item.ingredients);
              return (
                <div key={item.id} className="animate-in" style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', animationDelay: `${i * 0.05}s` }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)', marginTop: '8px', marginLeft: '-24px', boxShadow: '0 0 10px var(--accent-orange)' }}></div>
                  <div className="glass-card" style={{ flex: 1, marginBottom: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: editingId === item.id ? '1px solid var(--accent-orange)' : '1px solid var(--card-border)' }}>
                    <div onClick={() => setSelectedMealForIngredients(item)} style={{ cursor: 'pointer', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-orange)', background: 'rgba(255, 114, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{item.type}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{item.meal}</div>
                      
                      {macros.calories > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--accent-orange)', background: 'rgba(255, 114, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            <Flame size={10} /> {Math.round(macros.calories)} kcal
                          </div>
                          <div style={{ fontSize: '10px', opacity: 0.6 }}>P: {Math.round(macros.protein)}g | C: {Math.round(macros.carbs)}g | F: {Math.round(macros.fat)}g</div>
                        </div>
                      )}
                      
                      {(!item.ingredients || item.ingredients.length === 0) && (
                        <div style={{ fontSize: '10px', opacity: 0.4, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Info size={10} /> Tap to add ingredients
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Edit2 size={16} style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => startEdit(item)} />
                      <Trash2 size={16} className="text-red-500" style={{ opacity: 0.4, cursor: 'pointer' }} onClick={() => deleteMeal(item.id)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TimePicker isOpen={showTimePicker} onClose={() => setShowTimePicker(false)} onSelect={(time) => { setCurrentTime(time); setShowTimePicker(false); }} initialTime={currentTime} />

      {selectedMealForIngredients && (
        <div className="sidebar-backdrop" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div className="glass-card animate-in-up" style={{ width: '100%', maxWidth: '480px', height: '85vh', borderRadius: '32px 32px 0 0', padding: '24px', position: 'relative', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{activeMeal?.meal}</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>{activeMeal?.type} • {activeMeal?.time}</p>
              </div>
              <button onClick={() => setSelectedMealForIngredients(null)} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <div className="glass-card" style={{ background: 'rgba(255, 114, 94, 0.1)', border: 'none', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>Total Calories</div>
                  <div style={{ fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={24} style={{ color: 'var(--accent-orange)' }} /> {Math.round(mealMacros.calories)}
                  </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>P: {Math.round(mealMacros.protein)}g</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>C: {Math.round(mealMacros.carbs)}g</div>
                  <div style={{ fontSize: '12px', opacity: 0.6 }}>F: {Math.round(mealMacros.fat)}g</div>
               </div>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', border: editingIngredientId ? '1px solid var(--accent-orange)' : '1px solid var(--card-border)' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>{editingIngredientId ? 'Edit Ingredient' : 'Add Ingredient'}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Ingredient name (e.g. Oats)" value={newIngredient.name} onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 50px', gap: '8px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ fontSize: '10px', opacity: 0.5, marginLeft: '4px', marginBottom: '4px', display: 'block' }}>P (g)</label>
                    <input type="number" placeholder="0" value={newIngredient.protein} onChange={(e) => setNewIngredient({...newIngredient, protein: e.target.value})} style={{ padding: '10px', fontSize: '14px', textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', opacity: 0.5, marginLeft: '4px', marginBottom: '4px', display: 'block' }}>C (g)</label>
                    <input type="number" placeholder="0" value={newIngredient.carbs} onChange={(e) => setNewIngredient({...newIngredient, carbs: e.target.value})} style={{ padding: '10px', fontSize: '14px', textAlign: 'center' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', opacity: 0.5, marginLeft: '4px', marginBottom: '4px', display: 'block' }}>F (g)</label>
                    <input type="number" placeholder="0" value={newIngredient.fat} onChange={(e) => setNewIngredient({...newIngredient, fat: e.target.value})} style={{ padding: '10px', fontSize: '14px', textAlign: 'center' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={addIngredient} style={{ background: 'var(--accent-orange)', padding: '0', height: '42px', width: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {editingIngredientId ? <Check size={20} /> : <Plus size={20} />}
                    </button>
                  </div>
                </div>
                {editingIngredientId && (
                  <button onClick={cancelEditIngredient} style={{ background: 'rgba(255,255,255,0.05)', fontSize: '12px', padding: '8px' }}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px' }}>Ingredients ({activeMeal?.ingredients?.length || 0})</h4>
                {activeMeal?.ingredients?.length > 0 && (
                  <span style={{ fontSize: '10px', opacity: 0.4 }}>Tap edit or trash to manage</span>
                )}
              </div>
              {(activeMeal?.ingredients || []).length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.2, padding: '30px 0', border: '1px dashed var(--card-border)', borderRadius: '24px' }}>
                  <Utensils size={32} style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '12px' }}>No ingredients added yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeMeal.ingredients.map(ing => (
                    <div key={ing.id} className="animate-in" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: editingIngredientId === ing.id ? '1px solid var(--accent-orange)' : '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{ing.name}</div>
                        <div style={{ fontSize: '10px', opacity: 0.5 }}>P: {ing.protein}g | C: {ing.carbs}g | F: {ing.fat}g • {Math.round(parseFloat(ing.protein)*4 + parseFloat(ing.carbs)*4 + parseFloat(ing.fat)*9)} kcal</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div onClick={() => startEditIngredient(ing)} style={{ padding: '8px', cursor: 'pointer', opacity: 0.3 }}>
                          <Edit2 size={14} style={{ color: 'var(--accent-orange)' }} />
                        </div>
                        <div onClick={() => deleteIngredient(ing.id)} style={{ padding: '8px', cursor: 'pointer', opacity: 0.3 }}>
                          <Trash2 size={14} className="text-red-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DietRoutine;
