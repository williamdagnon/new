import React from 'react';
import { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { Dashboard } from './components/Dashboard';
import { ToastProvider } from './components/ToastContainer';
import { UserType } from './types';

type AppMode = 'login' | 'signup' | 'dashboard';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('login');
  const [user, setUser] = useState<UserType | null>(null);

  const handleLogin = (phoneNumber: string) => {
    const mockUser: UserType = {
      id: 'user-123',
      phone: phoneNumber,
      country: 'TG',
      referralCode: 'APUIC12345',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUser(mockUser);
    setAppMode('dashboard');
  };

  const handleSignupSuccess = (phoneNumber: string) => {
    handleLogin(phoneNumber);
  };

  const handleLogout = () => {
    setUser(null);
    setAppMode('login');
  };

  return (
    <ToastProvider>
      {appMode === 'login' ? (
        <LoginForm
          onSwitchToSignup={() => setAppMode('signup')}
          onLogin={handleLogin}
        />
      ) : appMode === 'signup' ? (
        <SignupForm
          onSwitchToLogin={() => setAppMode('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </ToastProvider>
  );
}

export default App;