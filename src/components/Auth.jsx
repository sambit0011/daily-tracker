import React, { useState } from 'react';
import { User, Lock, Phone, UserPlus, LogIn } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [mobile, setMobile] = useState('');

  const getUsers = () => {
    const users = localStorage.getItem('app_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError('');

    if (password !== retypePassword) {
      setError('Passwords do not match');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
      setError('Username not available');
      return;
    }

    const newUser = { username, password, mobile };
    localStorage.setItem('app_users', JSON.stringify([...users, newUser]));
    
    // Switch to login after successful signup
    setIsSignup(false);
    setUsername('');
    setPassword('');
    setRetypePassword('');
    setMobile('');
    alert('Account created successfully! Please login.');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card glass-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            width: '64px', 
            height: '64px', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            {isSignup ? <UserPlus className="text-blue-500" size={32} /> : <LogIn className="text-blue-500" size={32} />}
          </div>
          <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="subtitle">{isSignup ? 'Join our health community' : 'Login to track your progress'}</p>
        </div>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          {isSignup && (
            <>
              <span className="label-text">Mobile Number</span>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', top: '22px', color: 'var(--text-secondary)' }} />
                <input 
                  type="tel" 
                  placeholder="Enter mobile number" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </>
          )}

          <span className="label-text">Username</span>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '22px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>

          <span className="label-text">Password</span>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '22px', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>

          {isSignup && (
            <>
              <span className="label-text">Confirm Password</span>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '22px', color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  placeholder="Retype password" 
                  value={retypePassword}
                  onChange={(e) => setRetypePassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </>
          )}

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" style={{ width: '100%', marginTop: '32px' }}>
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <button className="link-btn" onClick={() => { setIsSignup(!isSignup); setError(''); }}>
          {isSignup ? 'Already have an account? Login' : 'New user? Sign up here'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
