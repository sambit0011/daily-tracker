import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Utensils, Heart, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ActivityTracker from './components/ActivityTracker';
import DietTracker from './components/DietTracker';
import HealthTracker from './components/HealthTracker';
import Auth from './components/Auth';

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    steps: 0,
    calories: 0,
    water: 0,
    sleep: 0,
    weight: 0,
    mood: 'Good',
    activities: [],
    meals: [],
  });

  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`health_data_${user.username}`);
      if (savedData) {
        setData(JSON.parse(savedData));
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
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 20px 0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }}></div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Live Tracking</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '8px', 
            borderRadius: '10px' 
          }}
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="container animate-in" style={{ paddingTop: '10px' }}>
        {renderContent()}
      </div>

      <nav className="bottom-nav">
        <div 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard />
          <span>Overview</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity />
          <span>Activity</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'diet' ? 'active' : ''}`}
          onClick={() => setActiveTab('diet')}
        >
          <Utensils />
          <span>Diet</span>
        </div>
        <div 
          className={`nav-item ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <Heart />
          <span>Health</span>
        </div>
      </nav>
    </>
  );
};

export default App;
