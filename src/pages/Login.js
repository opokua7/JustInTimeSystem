import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const USERS = [
  { username: 'floormanager', password: 'Floor@1234',  role: 'Floor Manager',        path: '/floor-manager' },
  { username: 'stamper01',    password: 'Stamp@1234',  role: 'Stamper',              path: '/stamper' },
  { username: 'prodmgr',      password: 'ProdMgr@1234',role: 'Production Manager',   path: '/production-manager' },
];

function Login() {
  const navigate  = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleLogin = () => {
    const user = USERS.find(
      u => u.username === username && u.password === password
    );
    if (user) {
      localStorage.setItem('role', user.role);
      navigate(user.path);
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">JustInTime</div>
        <div className="login-subtitle">FloatFry Manufacturing Resource Planning</div>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">Username</label>
        <input
          className="login-input"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <label className="login-label">Password</label>
        <input
          className="login-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button className="login-btn" onClick={handleLogin}>
          Sign In
        </button>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#aaa' }}>
          <div style={{ marginBottom: '4px', fontWeight: '500', color: '#666' }}>Test credentials:</div>
          <div>floormanager / Floor@1234</div>
          <div>stamper01 / Stamp@1234</div>
          <div>prodmgr / ProdMgr@1234</div>
        </div>
      </div>
    </div>
  );
}

export default Login;