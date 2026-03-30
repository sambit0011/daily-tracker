import React, { useState } from 'react';
import { Plus, Coffee, GlassWater, Utensils, Trash2, Clock, ChevronRight, X, Calendar } from 'lucide-react';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DietTracker = ({ data, setData, globalData, selectedDate, setSelectedDate }) => {
  const [showLogMeal, setShowLogMeal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [logMode, setLogMode] = useState('plan'); // 'plan' or 'manual'
  const [selectedPlanMeal, setSelectedPlanMeal] = useState(null);
  
  // Day of week for the selected date
  const selectedDayName = days[new Date(selectedDate).getDay()];

  const [manualMeal, setManualMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    type: 'Breakfast'
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showNotification = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loggedMeals = data.meals || [];
  const plannedMeals = (globalData.dietRoutines && globalData.dietRoutines[selectedDayName]) || [];

  const dailyTotals = loggedMeals.reduce((acc, meal) => ({
    calories: acc.calories + (parseFloat(meal.calories) || 0),
    protein: acc.protein + (parseFloat(meal.protein) || 0),
    carbs: acc.carbs + (parseFloat(meal.carbs) || 0),
    fat: acc.fat + (parseFloat(meal.fat) || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

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

  const addLoggedMeal = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setData(prev => ({
      ...prev,
      meals: [...(prev.meals || []), newMeal]
    }));
    
    setShowLogMeal(false);
    showNotification('Meal logged successfully!');
  };

  const handleLogFromPlan = () => {
    if (!selectedPlanMeal) return;
    const macros = calculateMacros(selectedPlanMeal.ingredients || []);
    addLoggedMeal({
      name: selectedPlanMeal.meal,
      type: selectedPlanMeal.type,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat
    });
    setSelectedPlanMeal(null);
  };

  const handleManualLog = (e) => {
    e.preventDefault();
    if (!manualMeal.name || !manualMeal.calories) return;
    addLoggedMeal(manualMeal);
    setManualMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', type: 'Breakfast' });
  };

  const deleteLoggedMeal = (id) => {
    setData(prev => ({
      ...prev,
      meals: (prev.meals || []).filter(m => m.id !== id)
    }));
    showNotification('Log entry removed');
  };

  const addWater = (amount) => {
    setData(prev => ({ ...prev, water: prev.water + (amount / 250) }));
    showNotification(`Added ${amount}ml water`);
  };

  const PROTEIN_TARGET = 140;
  const WATER_TARGET_ML = 5000;
  const CALORIE_TARGET = 2500;

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="diet-tracker-view animate-in">
      {showToast && <div className="toast-notification">{toastMsg}</div>}
      
      <div 
        onClick={() => setShowDatePicker(true)}
        className="clickable-header"
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '4px',
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: '16px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ background: 'var(--accent-blue)', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Calendar size={18} style={{ color: 'white' }} />
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '-2px', letterSpacing: '0.05em' }}>Viewing Log For</div>
          <h1 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isToday ? 'Today' : new Date(selectedDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            <ChevronRight size={16} style={{ opacity: 0.5, transform: 'rotate(90deg)' }} />
          </h1>
        </div>
      </div>
      <p className="subtitle" style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.5 }}>{selectedDayName}, {new Date(selectedDate).toLocaleDateString([], { year: 'numeric' })}</p>

      {/* Daily Progress Overview */}
      <div className="glass-card" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Calories</div>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>{Math.round(dailyTotals.calories)} <span style={{ fontSize: '14px', fontWeight: '400', opacity: 0.6 }}>/ {CALORIE_TARGET} kcal</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', opacity: 0.8, color: 'var(--accent-green)', fontWeight: '600' }}>Protein: {Math.round(dailyTotals.protein)}g / {PROTEIN_TARGET}g</div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>C: {Math.round(dailyTotals.carbs)}g | F: {Math.round(dailyTotals.fat)}g</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>
             <span>Energy Intake</span>
             <span>{Math.round((dailyTotals.calories / CALORIE_TARGET) * 100)}%</span>
          </div>
          <div className="progress-bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', marginTop: 0 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (dailyTotals.calories / CALORIE_TARGET) * 100)}%`, background: 'var(--accent-green)' }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px', opacity: 0.6 }}>
             <span>Protein Goal</span>
             <span>{Math.round((dailyTotals.protein / PROTEIN_TARGET) * 100)}%</span>
          </div>
          <div className="progress-bar" style={{ height: '8px', background: 'rgba(255,255,255,0.05)', marginTop: 0 }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, (dailyTotals.protein / PROTEIN_TARGET) * 100)}%`, background: 'var(--accent-purple)' }}></div>
          </div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {/* Water Tracker */}
        <div className="glass-card" style={{ marginBottom: 0, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GlassWater size={20} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: '600' }}>Hydration</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(data.water * 250)}</span>
              <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '2px' }}>/ {WATER_TARGET_ML}ml</span>
            </div>
          </div>
          
          <div className="progress-bar" style={{ height: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)' }}>
            <div className="progress-fill" style={{ width: `${Math.min(100, ((data.water * 250) / WATER_TARGET_ML) * 100)}%`, background: 'var(--accent-blue)' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => addWater(250)} style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>+250ml</button>
            <button onClick={() => addWater(500)} style={{ flex: 1, padding: '8px', fontSize: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>+500ml</button>
          </div>
        </div>

        {/* Quick Log Action */}
        <div className="glass-card" onClick={() => setShowLogMeal(true)} style={{ marginBottom: 0, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', border: '1px dashed var(--card-border)' }}>
          <div style={{ background: 'var(--accent-green)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <Plus size={24} />
          </div>
          <span style={{ fontWeight: '600' }}>Log Meal</span>
        </div>
      </div>

      {/* Logged History */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Logged on {isToday ? 'Today' : selectedDate}</h3>
        {loggedMeals.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', opacity: 0.5 }}>
            <Utensils size={40} style={{ margin: '0 auto 12px auto', opacity: 0.2 }} />
            <p>No meals logged yet for {isToday ? 'today' : 'this day'}.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loggedMeals.map(meal => (
              <div key={meal.id} className="glass-card animate-in" style={{ marginBottom: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Coffee size={20} style={{ color: 'var(--accent-green)' }} />
                   </div>
                   <div>
                     <div style={{ fontSize: '16px', fontWeight: '600' }}>{meal.name}</div>
                     <div style={{ fontSize: '12px', opacity: 0.6 }}>{meal.type} • {meal.time}</div>
                   </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>{Math.round(meal.calories)}</div>
                    <div style={{ fontSize: '10px', opacity: 0.5 }}>kcal</div>
                  </div>
                  <Trash2 size={16} style={{ opacity: 0.3, cursor: 'pointer' }} onClick={() => deleteLoggedMeal(meal.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Picker Overlay */}
      {showDatePicker && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowDatePicker(false)}></div>
          <div className="bottom-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Select Date</h3>
              <X onClick={() => setShowDatePicker(false)} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button 
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today.toISOString().split('T')[0]);
                  setShowDatePicker(false);
                }}
                style={{ 
                  background: isToday ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '16px' 
                }}
              >
                <span>Today</span>
                <span style={{ opacity: 0.5 }}>{new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </button>
              
              <button 
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday.toISOString().split('T')[0]);
                  setShowDatePicker(false);
                }}
                style={{ 
                  background: selectedDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '16px' 
                }}
              >
                <span>Yesterday</span>
                <span style={{ opacity: 0.5 }}>{new Date(Date.now() - 86400000).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </button>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px', marginBottom: '8px', display: 'block' }}>Pick a custom date:</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    style={{ 
                      flex: 1, 
                      padding: '16px', 
                      borderRadius: '16px', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--card-border)',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  />
                  <button 
                    onClick={() => setShowDatePicker(false)}
                    style={{ 
                      background: 'var(--accent-blue)', 
                      padding: '0 20px',
                      borderRadius: '16px',
                      fontWeight: '700'
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Log Meal Overlay */}
      {showLogMeal && (
        <>
          <div className="bottom-sheet-backdrop" onClick={() => setShowLogMeal(false)}></div>
          <div className="bottom-sheet" style={{ height: 'auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0 }}>Log New Meal</h3>
              <X onClick={() => setShowLogMeal(false)} style={{ opacity: 0.5 }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
              <button 
                onClick={() => setLogMode('plan')} 
                style={{ flex: 1, padding: '8px', fontSize: '14px', background: logMode === 'plan' ? 'var(--card-bg)' : 'transparent', color: logMode === 'plan' ? 'white' : 'var(--text-secondary)', boxShadow: logMode === 'plan' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none' }}
              >
                From Plan
              </button>
              <button 
                onClick={() => setLogMode('manual')} 
                style={{ flex: 1, padding: '8px', fontSize: '14px', background: logMode === 'manual' ? 'var(--card-bg)' : 'transparent', color: logMode === 'manual' ? 'white' : 'var(--text-secondary)', boxShadow: logMode === 'manual' ? '0 2px 10px rgba(0,0,0,0.2)' : 'none' }}
              >
                Manual Entry
              </button>
            </div>

            {logMode === 'plan' ? (
              <div>
                {plannedMeals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.5 }}>
                    <p>No meals planned for {selectedDayName}.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {plannedMeals.map(meal => {
                      const macros = calculateMacros(meal.ingredients || []);
                      return (
                        <div 
                          key={meal.id} 
                          onClick={() => setSelectedPlanMeal(meal)}
                          style={{ 
                            padding: '16px', 
                            borderRadius: '16px', 
                            background: selectedPlanMeal?.id === meal.id ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                            border: selectedPlanMeal?.id === meal.id ? '1px solid var(--accent-green)' : '1px solid var(--card-border)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700' }}>{meal.meal}</div>
                              <div style={{ fontSize: '12px', opacity: 0.6 }}>{meal.type} • {meal.time}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(macros.calories)}</div>
                              <div style={{ fontSize: '10px', opacity: 0.5 }}>kcal</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {plannedMeals.length > 0 && (
                  <button onClick={handleLogFromPlan} disabled={!selectedPlanMeal} style={{ width: '100%', padding: '16px', background: 'var(--accent-green)', opacity: selectedPlanMeal ? 1 : 0.5 }}>
                    Log Selected Meal
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleManualLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Meal Name</label>
                  <input type="text" placeholder="e.g. Chicken Salad" value={manualMeal.name} onChange={(e) => setManualMeal({...manualMeal, name: e.target.value})} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Meal Type</label>
                    <select value={manualMeal.type} onChange={(e) => setManualMeal({...manualMeal, type: e.target.value})}>
                      {['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Preworkout'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Calories (kcal)</label>
                    <input type="number" placeholder="0" value={manualMeal.calories} onChange={(e) => setManualMeal({...manualMeal, calories: e.target.value})} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Protein (g)</label>
                    <input type="number" placeholder="0" value={manualMeal.protein} onChange={(e) => setManualMeal({...manualMeal, protein: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Carbs (g)</label>
                    <input type="number" placeholder="0" value={manualMeal.carbs} onChange={(e) => setManualMeal({...manualMeal, carbs: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '4px' }}>Fat (g)</label>
                    <input type="number" placeholder="0" value={manualMeal.fat} onChange={(e) => setManualMeal({...manualMeal, fat: e.target.value})} />
                  </div>
                </div>

                <button type="submit" style={{ width: '100%', padding: '16px', background: 'var(--accent-green)', marginTop: '8px' }}>
                  Add to Log
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DietTracker;
