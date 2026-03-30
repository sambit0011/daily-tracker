import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Activity, Flame, Droplets, Moon } from 'lucide-react';

const Dashboard = ({ data }) => {
  const loggedMeals = data.meals || [];
  const dailyProtein = loggedMeals.reduce((acc, meal) => acc + (parseFloat(meal.protein) || 0), 0);

  const chartData = [
    { name: 'Mon', steps: 4000 },
    { name: 'Tue', steps: 3000 },
    { name: 'Wed', steps: 2000 },
    { name: 'Thu', steps: 2780 },
    { name: 'Fri', steps: 1890 },
    { name: 'Sat', steps: 2390 },
    { name: 'Sun', steps: 3490 },
  ];

  const stats = [
    { label: 'Steps', value: data.steps, goal: 10000, icon: <Activity className="text-blue-500" />, color: 'var(--accent-blue)' },
    { label: 'Calories', value: Math.round(data.calories), goal: 2500, icon: <Flame className="text-orange-500" />, color: 'var(--accent-orange)' },
    { label: 'Protein', value: Math.round(dailyProtein), goal: 140, icon: <Activity className="text-purple-500" />, color: 'var(--accent-purple)' },
    { label: 'Water', value: data.water, goal: 20, icon: <Droplets className="text-cyan-500" />, color: 'var(--accent-blue)' },
    { label: 'Sleep', value: data.sleep, goal: 8, icon: <Moon className="text-purple-500" />, color: 'var(--accent-purple)' },
  ];


  return (
    <div className="dashboard-view">
      <h1>Dashboard</h1>
      <p className="subtitle">Hello, here's your daily summary</p>

      <div className="stat-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', margin: '8px 0' }}>
              {stat.value}<span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-secondary)' }}> / {stat.goal}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.min((stat.value / stat.goal) * 100, 100)}%`, 
                  background: stat.color 
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ marginTop: '16px', height: '300px' }}>
        <h3 style={{ marginBottom: '20px' }}>Weekly Activity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              contentStyle={{ background: '#1a1a24', border: 'none', borderRadius: '12px' }} 
            />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 6 ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.1)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
