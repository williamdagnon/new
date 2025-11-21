import React, { useState } from 'react';
import { PhoneInput } from './PhoneInput';
import { Eye, EyeOff, AlertCircle, Crown, Zap, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { useToast } from './ToastContainer';
import { COUNTRIES } from '../constants';
import { Country } from '../types';
import { validatePhoneNumber } from '../utils/calculations';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onLogin: (phoneNumber: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    phoneNumber?: string;
    password?: string;
    general?: string;
  }>({});
  const toast = useToast();

  const demoCredentials = {
    phone: '12345678',
    password: 'Demo123!'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: typeof errors = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!validatePhoneNumber(phoneNumber, selectedCountry.code)) {
      newErrors.phoneNumber = 'Format de numéro invalide pour ce pays';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (phoneNumber === demoCredentials.phone && password === demoCredentials.password) {
        toast.success('Connexion réussie ! Bienvenue sur APUIC CAPITAL.');
        setTimeout(() => {
          onLogin(selectedCountry.dialCode + phoneNumber);
        }, 500);
      } else {
        toast.error('Identifiants incorrects. Utilisez les identifiants de démonstration !');
        setErrors({ general: 'Identifiants incorrects. Utilisez le numéro 12345678 et le mot de passe Demo123!' });
      }
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-100 animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg animate-bounce-subtle">
              <Logo className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Bienvenue sur APUIC CAPITAL
            </h1>
            <p className="text-gray-600 text-sm">
              Connectez-vous pour accéder à vos investissements
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center space-x-2">
              <Crown className="w-4 h-4" />
              <span>Accès VIP - Identifiants de démonstration</span>
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Téléphone :</strong> 12345678 (Togo)</p>
              <p><strong>Mot de passe :</strong> Demo123!</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhoneNumber('12345678');
                setPassword(demoCredentials.password);
                setSelectedCountry(COUNTRIES[0]);
                toast.info('Identifiants de démonstration chargés automatiquement');
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline flex items-center space-x-1 transition-all"
            >
              <Zap className="w-3 h-3" />
              <span>Remplir automatiquement</span>
            </button>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3 animate-slide-in-left">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays et Numéro de Téléphone
              </label>
              <PhoneInput
                phoneNumber={phoneNumber}
                selectedCountry={selectedCountry}
                onPhoneChange={setPhoneNumber}
                onCountrySelect={setSelectedCountry}
                error={errors.phoneNumber}
              />
              {selectedCountry && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedCountry.dialCode} {selectedCountry.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de Passe de Connexion
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Se Connecter Maintenant</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Vous n'avez pas encore de compte ?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2025 APUIC CAPITAL - 5 pays. 1 vision. 90 jours pour transformer ton capital.
          </p>
        </div>
      </div>
    </div>
  );
};
