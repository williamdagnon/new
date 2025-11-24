import React, { useState, useEffect } from 'react';
import { PhoneInput } from './PhoneInput';
import { OTPInput } from './OTPInput';
import { Shield, CheckCircle, Eye, EyeOff, Crown, Sparkles, Send } from 'lucide-react';
import { Logo } from './Logo';
import { COUNTRIES } from '../constants';
import { Country } from '../types';
import { validatePhoneNumber, generateReferralCode } from '../utils/calculations';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: (phoneNumber: string, countryCode: string, fullName: string, password: string, referralCode?: string) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [step, setStep] = useState<'registration' | 'verification' | 'success'>('registration');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Togo par défaut
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    fullName?: string;
    referral?: string;
    otp?: string;
    general?: string;
  }>({});

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validatePassword = (pwd: string): boolean => {
    return pwd.length >= 6;
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!validatePhoneNumber(phoneNumber, selectedCountry.code)) {
      newErrors.phone = 'Format de numéro invalide pour ce pays';
    }

    if (!password.trim()) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('verification');
      setCountdown(60);
    } catch (error) {
      setErrors({ general: 'Erreur lors de l\'envoi du code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (otp.length !== 6) {
      setErrors({ otp: 'Le code doit contenir 6 chiffres' });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('success');
      // Auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        onSignupSuccess(phoneNumber, selectedCountry.code, fullName, password, referralCode || undefined);
      }, 2000);
    } catch (error) {
      setErrors({ otp: 'Code de vérification incorrect' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(60);
    } catch (error) {
      console.error('Erreur lors du renvoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = (otpValue: string) => {
    setOtp(otpValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {step === 'registration' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Logo className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bienvenue sur APUIC CAPITAL
              </h1>
              <p className="text-gray-600 text-sm">
                Inscrivez-vous pour démarrer votre aventure d'investissement
              </p>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-6">
              {/* Pays et Numéro de Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays et Numéro de Téléphone
                </label>
                <PhoneInput
                  phoneNumber={phoneNumber}
                  selectedCountry={selectedCountry}
                  onPhoneChange={setPhoneNumber}
                  onCountrySelect={setSelectedCountry}
                  error={errors.phone}
                />
                {selectedCountry && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedCountry.dialCode} {selectedCountry.name}
                  </p>
                )}
              </div>

              {/* Mot de Passe */}
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

              {/* Pseudo (Nom complet) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Votre nom complet"
                  required
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Code de Parrainage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de Parrainage <span className="text-gray-400">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Entrez le code de parrainage (optionnel)"
                />
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Continuer</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  Se Connecter
                </button>
              </p>
            </div>
          </div>
        )}

        {step === 'verification' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Code de Vérification
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Entrez le code reçu par SMS
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-sm text-gray-700">
                  Code envoyé au : <span className="font-semibold">{selectedCountry.dialCode} {phoneNumber}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Code à 6 chiffres...
                </label>
                <OTPInput
                  length={6}
                  onComplete={handleOTPComplete}
                  error={!!errors.otp}
                />
                {errors.otp && (
                  <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Envoyer'}
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="bg-green-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Vérification...</span>
                    </div>
                  ) : (
                    "S'inscrire Maintenant"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-in zoom-in-50 duration-500">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Inscription Réussie !
            </h2>
            <p className="text-gray-600 mb-6">
              Bienvenue sur APUIC CAPITAL. Redirection vers votre tableau de bord...
            </p>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-600 font-semibold">Connexion automatique...</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2025 APUIC CAPITAL - 5 pays. 1 vision. 90 jours pour transformer ton capital.
          </p>
        </div>
      </div>
    </div>
  );
};