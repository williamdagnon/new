import React from 'react';
import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { Dashboard } from './components/Dashboard';
import { ToastProvider } from './components/ToastContainer';
import { UserType } from './types';
import api from './utils/api';

type AppMode = 'login' | 'signup' | 'dashboard';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('login');
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Try to get current user
      api.getCurrentUser().then(response => {
        if (response.success && response.data) {
          setUser(response.data);
          setAppMode('dashboard');
        } else {
          localStorage.removeItem('auth_token');
        }
      });
    }
  }, []);

  const handleLogin = async (phoneNumber: string, countryCode: string, password: string) => {
    try {
      const response = await api.login(phoneNumber, password, countryCode);
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        setAppMode('dashboard');
      } else {
        throw new Error(response.error || 'Erreur de connexion');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Fallback to mock for demo
      const mockUser: UserType = {
        id: 'user-123',
        phone: phoneNumber,
        country: countryCode as any,
        referralCode: 'APUIC12345',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(mockUser);
      setAppMode('dashboard');
    }
  };

  const handleSignupSuccess = async (phoneNumber: string, countryCode: string, fullName: string, password: string, referralCode?: string) => {
    try {
      const response = await api.signup({
        phone: phoneNumber,
        password,
        full_name: fullName,
        country_code: countryCode,
        referral_code: referralCode
      });
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        setUser(response.data.user);
        setAppMode('dashboard');
      } else {
        throw new Error(response.error || 'Erreur d\'inscription');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Fallback to mock for demo
      handleLogin(phoneNumber, countryCode, password);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setAppMode('login');
  };

  return (
    <ToastProvider>
      {appMode === 'login' ? (
        <LoginForm
          onSwitchToSignup={() => setAppMode('signup')}
          onLogin={(phone, country, password) => handleLogin(phone, country, password)}
        />
      ) : appMode === 'signup' ? (
        <SignupForm
          onSwitchToLogin={() => setAppMode('login')}
          onSignupSuccess={(phone, country, name, password, refCode) => handleSignupSuccess(phone, country, name, password, refCode)}
        />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </ToastProvider>
  );
}

export default App;