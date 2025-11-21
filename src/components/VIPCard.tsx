import React from 'react';
import { Crown, TrendingUp, Clock, Star } from 'lucide-react';
import { VIPLevel } from '../types';
import { formatCurrency } from '../utils/calculations';

interface VIPCardProps {
  level: VIPLevel;
  onSelect: (level: VIPLevel) => void;
  isSelected?: boolean;
  userBalance?: number;
}

export const VIPCard: React.FC<VIPCardProps> = ({ 
  level, 
  onSelect, 
  isSelected = false,
  userBalance = 0 
}) => {
  const canAfford = userBalance >= level.minAmount;
  
  const getLevelIcon = (levelNum: number) => {
    if (levelNum <= 3) return Crown;
    if (levelNum <= 6) return Star;
    return Crown; // Premium levels
  };

  const Icon = getLevelIcon(level.level);

  return (
    <div 
      onClick={() => canAfford && onSelect(level)}
      className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl border-2 transition-all duration-300 ${
        canAfford ? 'cursor-pointer hover:shadow-xl dark:hover:shadow-2xl hover:scale-105' : 'opacity-60 cursor-not-allowed'
      } ${
        isSelected ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Badge niveau */}
      <div 
        className="absolute -top-2 -right-2 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg"
        style={{ backgroundColor: level.color }}
      >
        <Icon className="w-3 h-3" />
        <span>Niveau {level.level}</span>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${level.color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: level.color }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{level.name}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">Rendement garanti</p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-4">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Quotidien</span>
            </div>
            <div className="font-bold text-green-600 dark:text-green-400">10%</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-slate-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Durée</span>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">{level.duration} jours</div>
          </div>
        </div>

        {/* Montant minimum */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-600 dark:text-slate-400 mb-1">Investissement minimum :</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(level.minAmount)}
          </div>
        </div>

        {/* Exemple de gains */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-700 dark:text-green-400 mb-2">
            Exemple avec {formatCurrency(level.minAmount)} :
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-700 dark:text-green-400">Gain quotidien :</span>
              <span className="font-semibold text-green-800 dark:text-green-300">
                {formatCurrency(level.minAmount * level.dailyReturn)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700 dark:text-green-400">Gain total (90j) :</span>
              <span className="font-bold text-green-800 dark:text-green-300">
                {formatCurrency(level.minAmount * level.dailyReturn * level.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Statut d'accessibilité */}
        {!canAfford && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
            <div className="text-xs text-red-700 dark:text-red-400 text-center">
              Solde insuffisant
            </div>
          </div>
        )}

        {/* Bouton de sélection */}
        <button
          disabled={!canAfford}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
            isSelected
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
              : canAfford
              ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSelected ? 'Sélectionné' : canAfford ? 'Choisir ce niveau' : 'Solde insuffisant'}
        </button>
      </div>
    </div>
  );
};