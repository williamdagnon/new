import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3, TrendingUp, Crown, Users, History, Sparkles, Zap,
  ArrowUpRight, ArrowDownRight, Bell, Settings, LogOut,
  Plus, UserPlus, Gift, Target, Wallet, PiggyBank,
  Send, CheckCircle, Copy, Flame, Sun, Moon
} from "lucide-react";
import { BottomNav } from "./BottomNav";
import { Logo } from "./Logo";
import { VIPCard } from "./VIPCard";
import { StakingCard } from "./StakingCard";
import { useToast } from "./ToastContainer";
import { VIP_LEVELS, STAKING_LOTS } from "../constants";
import { formatCurrency } from "../utils/calculations";
import { Transaction, UserType } from "../types";

interface DashboardProps {
  user: UserType | null;
  onLogout: () => void;
}

type TabKey = "overview" | "vip" | "staking" | "wallet" | "team" | "history" | "support";

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedVIPLevel, setSelectedVIPLevel] = useState<number | null>(null);
  const [selectedStakingLot, setSelectedStakingLot] = useState<number | null>(null);
  const toast = useToast();
  const [isDark, setIsDark] = useState<boolean>(true); // Dark mode by default
  const heroRef = useRef<HTMLDivElement | null>(null);

  const walletBalance = 125000;
  const totalInvested = 285000;
  const totalEarned = 95000;
  const activeInvestments = 3;
  const referralCode = 'APUIC12345';

  const recentTransactions: Transaction[] = [
    { id: '1', userId: user?.id || '', type: 'earning', amount: 7500, status: 'completed', description: 'Gains quotidiens VIP Gold + Staking Lot 4', createdAt: '2025-01-18T08:00:00Z' },
    { id: '2', userId: user?.id || '', type: 'deposit', amount: 50000, status: 'approved', description: 'Dépôt Mobile Money', createdAt: '2025-01-17T14:30:00Z' },
    { id: '3', userId: user?.id || '', type: 'commission', amount: 3000, status: 'completed', description: 'Commission parrainage niveau 1', createdAt: '2025-01-16T10:15:00Z' },
    { id: '4', userId: user?.id || '', type: 'withdrawal', amount: 20000, status: 'completed', description: 'Retrait portefeuille', createdAt: '2025-01-15T12:00:00Z' },
    { id: '5', userId: user?.id || '', type: 'earning', amount: 5200, status: 'completed', description: 'Gains quotidiens Staking Lot 5', createdAt: '2025-01-14T08:30:00Z' },
  ];

  const teamMembers = [
    { id: 1, name: "Koffi A.", country: "🇹🇬", level: "VIP Silver", earnings: 15000, date: "2025-01-10", status: "active" },
    { id: 2, name: "Adjoa M.", country: "🇨🇮", level: "Staking Lot 3", earnings: 8000, date: "2025-01-08", status: "active" },
    { id: 3, name: "Moussa S.", country: "🇧🇫", level: "VIP Gold", earnings: 25000, date: "2025-01-05", status: "active" },
    { id: 4, name: "Awa B.", country: "🇸🇳", level: "VIP Bronze", earnings: 5500, date: "2025-01-03", status: "active" },
    { id: 5, name: "Kofi Y.", country: "🇬🇭", level: "Staking Lot 2", earnings: 3200, date: "2025-01-01", status: "inactive" },
  ];

  // Theme handling - Dark mode by default
  useEffect(() => {
    const stored = localStorage.getItem('ap_theme');
    const initial = stored ? stored === 'dark' : true; // Default to dark mode (true)
    setIsDark(initial);
    if (initial) document.documentElement.classList.add('dark');
  }, []);

  // Hero auto-scroll
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let idx = 0;
    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;
    const interval = setInterval(() => {
      idx = (idx + 1) % children.length;
      const target = children[idx];
      if (target) {
        el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [heroRef]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('ap_theme', next ? 'dark' : 'light');
  };

  const handleInvestmentSubmit = (type: 'vip' | 'stake') => {
    toast.success(`Investissement ${type === 'vip' ? 'VIP' : 'Staking'} confirmé avec succès !`);
    if (type === 'vip') setSelectedVIPLevel(null);
    else setSelectedStakingLot(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code de parrainage copié !');
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changePercent?: number;
    icon: React.ReactNode;
    trend?: "up" | "down";
    gradient?: string;
  }> = ({ title, value, change, changePercent, icon, trend, gradient = "from-blue-500 to-cyan-500" }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-slate-700 p-6 hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${gradient} text-white rounded-xl shadow-md`}>{icon}</div>
        {trend && (
          <div
            className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
              trend === "up" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {changePercent}%
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-600 dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {change && (
        <p
          className={`text-sm mt-1 ${
            trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* HEADER MOBILE ÉPURÉ */}
      <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 shadow-sm dark:shadow-lg transition-colors duration-300 md:flex md:justify-between md:px-8">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 animate-slide-in-left">
              <Logo className="w-8 h-8" />
              <span className="hidden sm:block font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 text-transparent bg-clip-text">
                APUIC CAPITAL
              </span>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center space-x-2">
              {[
                { key: "overview", label: "Tableau de bord", icon: BarChart3, gradient: "from-blue-500 to-cyan-500" },
                { key: "vip", label: "VIP", icon: Crown, gradient: "from-yellow-500 to-orange-500" },
                { key: "staking", label: "Staking", icon: Target, gradient: "from-emerald-500 to-green-500" },
                { key: "wallet", label: "Portefeuille", icon: Wallet, gradient: "from-violet-500 to-purple-500" },
                { key: "team", label: "Équipe", icon: Users, gradient: "from-pink-500 to-rose-500" },
              ].map(({ key, label, icon: Icon, gradient }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === key
                      ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* ACTIONS HEADER - MOBILE ÉPURÉ */}
            <div className="flex items-center space-x-1 sm:space-x-2 animate-slide-in-right">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title="Basculer thème"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              
              {/* Settings - hidden on mobile */}
              <button
                onClick={() => toast.info('Paramètres')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors hidden sm:block text-gray-600 dark:text-slate-300"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {/* Logout */}
              <button
                onClick={() => {
                  toast.success('Déconnexion réussie. À bientôt !');
                  setTimeout(onLogout, 500);
                }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* HERO DÉFILANT */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
              <div
                ref={heroRef}
                className="flex gap-4 py-6 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ scrollBehavior: 'smooth' }}
              >
                {[
                  { title: "VIP Gold", desc: "10% quotidien - 90 jours", min: 25000, color: "from-amber-400 to-orange-600" },
                  { title: "VIP Diamond", desc: "10% quotidien - Premium", min: 100000, color: "from-cyan-300 to-blue-600" },
                  { title: "Staking Pro", desc: "Jusqu'à 15% - Court terme", min: 2500, color: "from-emerald-400 to-green-600" },
                  { title: "VIP Master", desc: "Accès VIP+ & Parrainage", min: 500000, color: "from-purple-400 to-pink-600" },
                ].map((promo, i) => (
                  <div
                    key={i}
                    className={`min-w-[280px] snap-center bg-gradient-to-br ${promo.color} text-white rounded-2xl p-6 flex-shrink-0 shadow-2xl hover:shadow-3xl transition-all`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-xl font-bold">{promo.title}</h2>
                      <Flame className="w-5 h-5 animate-pulse" />
                    </div>
                    <p className="mt-2 text-sm text-white/90 mb-4">{promo.desc}</p>
                    <div className="flex items-center justify-between bg-white/20 rounded-lg p-3 backdrop-blur">
                      <span className="text-xs font-semibold">Min: {formatCurrency(promo.min)}</span>
                      <button
                        onClick={() => { setActiveTab('vip'); toast.info('Voir VIPs'); }}
                        className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      >
                        Investir →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Solde Disponible"
                value={formatCurrency(walletBalance)}
                icon={<Wallet className="w-6 h-6" />}
                gradient="from-emerald-500 to-green-500"
              />
              <StatCard
                title="Total Investi"
                value={formatCurrency(totalInvested)}
                icon={<PiggyBank className="w-6 h-6" />}
                gradient="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Gains Totaux"
                value={formatCurrency(totalEarned)}
                change={`+${formatCurrency(7500)}`}
                changePercent={15.2}
                trend="up"
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="from-violet-500 to-purple-500"
              />
              <StatCard
                title="Investissements Actifs"
                value={`${activeInvestments}`}
                icon={<Target className="w-6 h-6" />}
                gradient="from-orange-500 to-red-500"
              />
            </div>

            {/* CTA BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => { setActiveTab('vip'); toast.info('Découvrez nos plans VIP'); }}
                className="bg-gradient-to-r from-yellow-400 to-orange-600 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up shadow-lg"
              >
                <Crown className="w-8 h-8 mb-3 mx-auto" />
                <div className="text-sm font-semibold">Investissement VIP</div>
                <div className="text-xs opacity-90 mt-1">10% quotidien garanti</div>
              </button>

              <button
                onClick={() => { setActiveTab('staking'); toast.info('Explorez nos lots de staking'); }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up shadow-lg"
              >
                <Zap className="w-8 h-8 mb-3 mx-auto" />
                <div className="text-sm font-semibold">Staking</div>
                <div className="text-xs opacity-90 mt-1">Jusqu'à 15% quotidien</div>
              </button>

              <button
                onClick={() => { setActiveTab('wallet'); toast.info('Gérez votre portefeuille'); }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up shadow-lg"
              >
                <Plus className="w-8 h-8 mb-3 mx-auto" />
                <div className="text-sm font-semibold">Dépôt</div>
                <div className="text-xs opacity-90 mt-1">Min. {formatCurrency(3000)}</div>
              </button>

              <button
                onClick={() => { setActiveTab('team'); copyToClipboard(referralCode); }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up shadow-lg"
              >
                <UserPlus className="w-8 h-8 mb-3 mx-auto" />
                <div className="text-sm font-semibold">Parrainer</div>
                <div className="text-xs opacity-90 mt-1">Jusqu'à 15% commission</div>
              </button>
            </div>

            {/* VIP SHOWCASE */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Produits VIP recommandés</h3>
                <div className="text-sm text-gray-500 dark:text-slate-400">Basé sur votre profil</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VIP_LEVELS.slice(0, 4).map(level => (
                  <VIPCard
                    key={level.level}
                    level={level}
                    onSelect={() => { setSelectedVIPLevel(level.level); setActiveTab('vip'); toast.success(`Niveau ${level.level} sélectionné`); }}
                    isSelected={selectedVIPLevel === level.level}
                    userBalance={walletBalance}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'vip' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Plans VIP Premium</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Choisissez un plan adapté à vos objectifs. Rendement garanti et transparent.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIP_LEVELS.map(level => (
                <VIPCard
                  key={level.level}
                  level={level}
                  onSelect={() => { setSelectedVIPLevel(level.level); handleInvestmentSubmit('vip'); }}
                  isSelected={selectedVIPLevel === level.level}
                  userBalance={walletBalance}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'staking' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-8 h-8 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lots de Staking</h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Investissements flexibles avec rendements élevés et durées courtes.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAKING_LOTS.map(lot => (
                <StakingCard key={lot.lot} lot={lot} onSelect={() => { setSelectedStakingLot(lot.lot); handleInvestmentSubmit('stake'); }} isSelected={selectedStakingLot === lot.lot} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <Wallet className="w-8 h-8 text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Portefeuille</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg border border-green-100 dark:border-green-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Send className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span>Effectuer un dépôt</span>
                </h3>
                <button
                  onClick={() => toast.success('Demande de dépôt soumise ! Elle sera traitée dans les 24h.')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Soumettre la demande
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Effectuer un retrait</span>
                </h3>
                <button
                  onClick={() => toast.info('Demande de retrait soumise. Traitement durant les heures de support.')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 inline mr-2" />
                  Demander le retrait
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-pink-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Mon Équipe</h2>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">Code de parrainage :</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white dark:bg-slate-800 px-4 py-3 rounded-lg font-mono font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700">
                  {referralCode}
                </div>
                <button
                  onClick={() => copyToClipboard(referralCode)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">Partagez ce code pour gagner des commissions jusqu'à 15%.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl">{m.country}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'}`}>
                      {m.status === 'active' ? '🟢 Actif' : '⚪ Inactif'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{m.name}</div>
                    <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">{m.level}</div>
                    <div className="text-green-600 dark:text-green-400 font-bold mt-3">{formatCurrency(m.earnings)}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-500 mt-2">{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <History className="w-8 h-8 text-purple-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Historique des Transactions</h2>
            </div>
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'earning' ? 'bg-green-100 dark:bg-green-900/30' :
                      tx.type === 'deposit' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      tx.type === 'commission' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {tx.type === 'earning' && <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {tx.type === 'deposit' && <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                      {tx.type === 'commission' && <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                      {tx.type === 'withdrawal' && <ArrowUpRight className="w-5 h-5 text-red-600 dark:text-red-400" />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{tx.description}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{new Date(tx.createdAt).toLocaleDateString()} à {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${tx.type === 'withdrawal' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-8 h-8 text-amber-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Support & FAQ</h2>
            </div>
            <div className="space-y-3">
              <details className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow group">
                <summary className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Comment puis-je déposer ?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600 dark:text-slate-300">Utilisez les méthodes Mobile Money disponibles (Orange Money, MTN Money, Wave, Moov Money). Les dépôts sont traités sous 24h.</div>
              </details>
              <details className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow group">
                <summary className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Quels sont les délais des gains ?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600 dark:text-slate-300">Les rendements quotidiens sont crédités chaque jour selon le plan choisi. Les gains s'accumulent et peuvent être retirés à tout moment.</div>
              </details>
              <details className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow group">
                <summary className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Puis-je modifier mon investissement ?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600 dark:text-slate-300">Vous pouvez ajouter de nouveaux investissements à tout moment. Les investissements existants suivront leur cycle jusqu'à sa fin.</div>
              </details>
              <details className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow group">
                <summary className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Comment fonctionne le parrainage ?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600 dark:text-slate-300">Partagez votre code de parrainage unique. Vous gagnez 15% sur les investissements directs, 3% au niveau 2, et 2% au niveau 3.</div>
              </details>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Contact Support</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-300 mt-2">support@apuic.example</div>
                <div className="text-sm text-gray-600 dark:text-slate-300">Réponse en 24-48h • Horaires : 09h - 18h (UTC+0)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV - MOBILE */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
};
