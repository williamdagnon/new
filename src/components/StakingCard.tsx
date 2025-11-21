import React from 'react';
import { Clock, TrendingUp, Zap, Star } from 'lucide-react';
import { StakingLot } from '../types';
import { formatCurrency } from '../utils/calculations';

interface StakingCardProps {
  lot: StakingLot;
  onSelect: (lot: StakingLot) => void;
  isSelected?: boolean;
}

export const StakingCard: React.FC<StakingCardProps> = ({ lot, onSelect, isSelected = false }) => {
  const getCardColor = (lotNumber: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
    ];
    return colors[lotNumber - 1] || colors[0];
  };

  const getPopularityBadge = (lotNumber: number) => {
    if (lotNumber === 4) return { text: 'Populaire', color: 'bg-orange-500' };
    if (lotNumber === 6) return { text: 'Recommandé', color: 'bg-green-500' };
    if (lotNumber === 7) return { text: 'Premium', color: 'bg-purple-500' };
    return null;
  };

  const badge = getPopularityBadge(lot.lot);

  return (
    <div 
      onClick={() => onSelect(lot)}
      className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-xl dark:hover:shadow-2xl hover:scale-105 ${
        isSelected ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Badge de popularité */}
      {badge && (
        <div className={`absolute -top-2 -right-2 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg`}>
          <Star className="w-3 h-3" />
          <span>{badge.text}</span>
        </div>
      )}

      {/* Header avec gradient */}
      <div className={`bg-gradient-to-r ${getCardColor(lot.lot)} text-white p-4 rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Lot {lot.lot}</h3>
            <p className="text-sm opacity-90">{lot.duration} jours</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{lot.dailyRate}%</div>
            <div className="text-xs opacity-90">par jour</div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Durée</span>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">{lot.duration} jours</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total</span>
            </div>
            <div className="font-bold text-green-600 dark:text-green-400">+{lot.totalReturn}%</div>
          </div>
        </div>

        {/* Exemple de calcul */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-slate-400 mb-2">Exemple avec {formatCurrency(10000)} :</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-slate-300">Gain quotidien :</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(10000 * (lot.dailyRate / 100))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-slate-300">Gain total :</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(10000 * (lot.totalReturn / 100))}
              </span>
            </div>
          </div>
        </div>

        {/* Minimum requis */}
        <div className="text-center text-xs text-gray-500 dark:text-slate-400">
          Minimum : {formatCurrency(lot.minAmount)}
        </div>

        {/* Bouton de sélection */}
        <button
          className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          {isSelected ? (
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Sélectionné</span>
            </div>
          ) : (
            'Choisir ce lot'
          )}
        </button>
      </div>
    </div>
  );
};