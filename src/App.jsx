import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Activity, Utensils, Heart, LogOut, Menu, X, 
  User as UserIcon, HelpCircle, Info, Mail, RotateCcw, Trash2, Calendar
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ActivityTracker from './components/ActivityTracker';
import DietTracker from './components/DietTracker';
import HealthTracker from './components/HealthTracker';
import RoutineTracker from './components/RoutineTracker';
import Auth from './components/Auth';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [data, setData] = useState({
    steps: 0,
    calories: 0,
    water: 0,
    sleep: 0,
    weight: 0,
    mood: 'Good',
    activities: [],
    meals: [],
    routines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
  });

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`health_data_${user.username}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Ensure routines exists in parsed data
        if (!parsed.routines) {
          parsed.routines = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };
        }
        setData(parsed);
      } else {
        setData({
          steps: 0,
          calories: 0,
          water: 0,
          sleep: 0,
          weight: 0,
          mood: 'Good',
          activities: [],
          meals: [],
          routines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
        });
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
    if (window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      setData({
        steps: 0,
        calories: 0,
        water: 0,
        sleep: 0,
        weight: 0,
        mood: 'Good',
        activities: [],
        meals: [],
        routines: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] }
      });
      setIsMenuOpen(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('CRITICAL: Are you sure you want to delete your account? All your data will be permanently removed.')) {
      const users = JSON.parse(localStorage.getItem('app_users') || '[]');
      const filteredUsers = users.filter(u => u.username !== user.username);
      localStorage.setItem('app_users', JSON.stringify(filteredUsers));
      localStorage.removeItem(`health_data_${user.username}`);
      handleLogout();
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'activity':
        return <ActivityTracker data={data} setData={setData} />;
      case 'diet':
        return <DietTracker data={data} setData={setData} />;
      case 'health':
        return <HealthTracker data={data} setData={setData} />;
      case 'routine':
        return <RoutineTracker data={data} setData={setData} />;
      default:
        return <Dashboard data={data} />;
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
          className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => { setActiveTab('activity'); setIsMenuOpen(false); }}
        >
          <Activity />
          <span>Activity</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'routine' ? 'active' : ''}`}
          onClick={() => { setActiveTab('routine'); setIsMenuOpen(false); }}
        >
          <Calendar />
          <span>Routine</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('diet'); setIsMenuOpen(false); }}
        >
          <Utensils />
          <span>Diet</span>
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
