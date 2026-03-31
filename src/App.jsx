import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Activity, Utensils, Heart, LogOut, Menu, X, 
  User as UserIcon, HelpCircle, Info, Mail, RotateCcw, Trash2, Calendar, ClipboardList
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ActivityTracker from './components/ActivityTracker';
import DietTracker from './components/DietTracker';
import HealthTracker from './components/HealthTracker';
import RoutineTracker from './components/RoutineTracker';
import DietRoutine from './components/DietRoutine';
import Auth from './components/Auth';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Date-aware tracking
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [data, setData] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    let initialState = {
      dailyLogs: {},
      routines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
      dietRoutines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
      mealLibrary: []
    };

    if (savedUser) {
      const u = JSON.parse(savedUser);
      const savedData = localStorage.getItem(`health_data_${u.username}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Migration logic for old data structure
        if (!parsed.dailyLogs) {
          const today = new Date().toISOString().split('T')[0];
          parsed.dailyLogs = {
            [today]: {
              steps: parsed.steps || 0,
              calories: parsed.calories || 0,
              water: parsed.water || 0,
              sleep: parsed.sleep || 0,
              weight: parsed.weight || 0,
              mood: parsed.mood || 'Good',
              activities: parsed.activities || [],
              meals: parsed.meals || []
            }
          };
          // Clean up old top-level props
          delete parsed.steps;
          delete parsed.calories;
          delete parsed.water;
          delete parsed.sleep;
          delete parsed.weight;
          delete parsed.mood;
          delete parsed.activities;
          delete parsed.meals;
        }

        if (!parsed.routines) {
          parsed.routines = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        }
        if (!parsed.dietRoutines) {
          parsed.dietRoutines = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        }
        if (!parsed.mealLibrary) {
          parsed.mealLibrary = [];
        }
        return parsed;
      }
    }
    return initialState;
  });

  // Helper to get logs for a specific date
  const getLogsForDate = (date) => {
    const defaultLog = {
      steps: 0,
      calories: 0,
      water: 0,
      sleep: 0,
      weight: 0,
      mood: 'Good',
      activities: [],
      meals: []
    };
    return data.dailyLogs[date] || defaultLog;
  };

  const updateDailyLog = (date, updates) => {
    setData(prev => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [date]: { ...getLogsForDate(date), ...updates }
      }
    }));
  };

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`health_data_${user.username}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Ensure migration also happens on user login/switch
        if (!parsed.dailyLogs) {
           // (Migration logic would normally repeat here or be a separate function)
        }
        setData(parsed);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`health_data_${user.username}`, JSON.stringify(data));
    }
  }, [data, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
    setIsMenuOpen(false);
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset ALL progress for ALL dates?')) {
      setData({
        dailyLogs: {},
        routines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
        dietRoutines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] },
        mealLibrary: []
      });
      setIsMenuOpen(false);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const dailyData = getLogsForDate(selectedDate);
  const setDailyData = (updates) => {
    if (typeof updates === 'function') {
      setData(prev => {
        const current = prev.dailyLogs[selectedDate] || {
          steps: 0, calories: 0, water: 0, sleep: 0, weight: 0, mood: 'Good', activities: [], meals: []
        };
        return {
          ...prev,
          dailyLogs: {
            ...prev.dailyLogs,
            [selectedDate]: updates(current)
          }
        };
      });
    } else {
      updateDailyLog(selectedDate, updates);
    }
  };

  const renderContent = () => {
    const commonProps = { 
      data: dailyData, 
      setData: setDailyData, 
      globalData: data, 
      setGlobalData: setData,
      selectedDate,
      setSelectedDate
    };

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} />;
      case 'activity':
        return <ActivityTracker {...commonProps} />;
      case 'diet':
        return <DietTracker {...commonProps} />;
      case 'dietPlan':
        return <DietRoutine data={data} setData={setData} />;
      case 'routine':
        return <RoutineTracker data={data} setData={setData} />;
      case 'health':
        return <HealthTracker {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };


  return (
    <>
      {/* Sidebar Menu */}
      {isMenuOpen && (
        <>
          <div className="sidebar-backdrop" onClick={() => setIsMenuOpen(false)}></div>
          <div className="sidebar">
            <div className="sidebar-header">
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <X onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="sidebar-user">
                <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '18px' }}>{user.username}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Premium Member</div>
                </div>
              </div>
            </div>

            <div className="sidebar-menu">
              <div className="menu-item"><UserIcon /> My Profile</div>
              <div className="menu-item"><Info /> App Guide</div>
              <div className="menu-item"><HelpCircle /> Help & Support</div>
              <div className="menu-item"><Mail /> Contact Us</div>
              
              <div style={{ height: '1px', background: 'var(--card-border)', margin: '16px 0' }}></div>
              
              <div className="menu-item" onClick={handleResetProgress}><RotateCcw /> Reset Progress</div>
              <div className="menu-item danger" onClick={handleDeleteAccount}><Trash2 /> Delete Account</div>
              <div className="menu-item" onClick={handleLogout}><LogOut /> Logout</div>
            </div>
          </div>
        </>
      )}

      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 20px 0 20px',
      }}>
        <button 
          onClick={() => setIsMenuOpen(true)}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '10px', 
            borderRadius: '12px',
            color: 'white'
          }}
        >
          <Menu size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Tracking</span>
        </div>
        
        <div style={{ width: '40px' }}></div>
      </header>

      <div className="container animate-in" style={{ paddingTop: '10px' }}>
        {renderContent()}
      </div>

      <nav className="bottom-nav">
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
        >
          <LayoutDashboard />
          <span>Overview</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'routine' ? 'active' : ''}`}
          onClick={() => { setActiveTab('routine'); setIsMenuOpen(false); }}
        >
          <Calendar />
          <span>Routine</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'dietPlan' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dietPlan'); setIsMenuOpen(false); }}
        >
          <ClipboardList />
          <span>Diet Chart</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('diet'); setIsMenuOpen(false); }}
        >
          <Utensils />
          <span>Log</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => { setActiveTab('health'); setIsMenuOpen(false); }}
        >
          <Heart />
          <span>Health</span>
        </div>
      </nav>
    </>
  );
};

export default App;
