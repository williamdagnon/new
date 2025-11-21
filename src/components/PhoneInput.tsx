import React from 'react';
import CountrySelector from './CountrySelector';
import { Country } from '../types';
import { validatePhoneNumber } from '../utils/calculations';

interface PhoneInputProps {
  phoneNumber: string;
  selectedCountry: Country;
  onPhoneChange: (phone: string) => void;
  onCountrySelect: (country: Country) => void;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  selectedCountry,
  onPhoneChange,
  onCountrySelect,
  error,
}) => {
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    // Format pour mobile : groupes plus petits
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return cleaned.slice(0, 2) + ' ' + cleaned.slice(2);
    if (cleaned.length <= 6) return cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4);
    return cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 4) + ' ' + cleaned.slice(4, 6) + ' ' + cleaned.slice(6, 9);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) { // Augmenté pour CI
      onPhoneChange(value);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        Numéro de téléphone
      </label>
      <div className="flex w-full min-w-0">
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountrySelect={onCountrySelect}
        />
        <input
          type="tel"
          value={formatPhoneNumber(phoneNumber)}
          onChange={handlePhoneChange}
          placeholder="12 34 56 789"
          className={`flex-1 min-w-0 px-2 sm:px-3 py-2.5 sm:py-3 border-t border-r border-b border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs sm:text-sm md:text-base ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          }`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs sm:text-sm">
          {error}
        </p>
      )}
    </div>
  );
};