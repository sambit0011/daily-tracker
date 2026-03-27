import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Utensils, Heart } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ActivityTracker from './components/ActivityTracker';
import DietTracker from './components/DietTracker';
import HealthTracker from './components/HealthTracker';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('health_tracker_data');
    return savedData ? JSON.parse(savedData) : {
      steps: 0,
      calories: 0,
      water: 0,
      sleep: 0,
      weight: 0,
      mood: 'Good',
      activities: [],
      meals: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('health_tracker_data', JSON.stringify(data));
  }, [data]);

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
      <div className="container animate-in">
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
