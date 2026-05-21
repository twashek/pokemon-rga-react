import React, { useState } from 'react';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pokemon123') {
      sessionStorage.setItem('isLoggedIn', 'true');
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div style={loginContainerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ marginBottom: '20px' }}>Login</h2>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: '#ff3b30', fontSize: '12px' }}>Incorrect password</p>}
        <button type="submit" style={buttonStyle}>Enter</button>
      </form>
    </div>
  );
};

// --- Styles ---
const loginContainerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  height: '100vh', fontFamily: '-apple-system, sans-serif', backgroundColor: '#f2f2f7'
};

const formStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '40px', borderRadius: '20px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', width: '300px'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px',
  border: '1px solid #d1d1d6', boxSizing: 'border-box', outline: 'none'
};

const buttonStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
  backgroundColor: '#007AFF', color: 'white', fontWeight: 'bold', cursor: 'pointer'
};
