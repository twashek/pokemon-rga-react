import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { AnswerGenerator } from './components/AnswerGenerator';
import { Login } from './components/Login';

const App = () => {
  // Check session storage to see if they are already authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  });

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AnswerGenerator />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
