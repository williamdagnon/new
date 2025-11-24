import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Copy, Loader, ChevronRight, Info } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { getBanks } from '../utils/bankService';
import { PLATFORM_CONFIG } from '../constants';
import { formatCurrency, calculateWithdrawalFees } from '../utils/calculations';
import { Bank } from '../types';

interface WithdrawalFormProps {
  onBack: () => void;
  onSuccess: () => void;
  userBalance?: number;
  userCountry?: string;
}

type StepType = 'amount' | 'bank' | 'confirmation' | 'processing' | 'success';

interface StepConfig {
  name: StepType;
  label: string;
  emoji: string;
}

const STEPS: StepConfig[] = [
  { name: 'amount', label: 'Montant', emoji: '💰' },
  { name: 'bank', label: 'Banque', emoji: '🏧' },
  { name: 'confirmation', label: 'Confirmer', emoji: '✅' },
  { name: 'processing', label: 'Traitement', emoji: '⏳' },
  { name: 'success', label: 'Succès', emoji: '✅' },
];

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ onBack, onSuccess, userBalance = 0, userCountry }) => {
  const [step, setStep] = useState<StepType>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCopyFeedback, setShowCopyFeedback] = useState<string | null>(null);
  const toast = useToast();

  const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000, 350000, 700000];

  useEffect(() => {
    if (step === 'bank') {
      const loadBanks = async (): Promise<void> => {
        setIsLoadingBanks(true);
        try {
          const bankList = await getBanks(userCountry);
          if (bankList && bankList.length > 0) {
            setBanks(bankList);
          } else {
            toast.error('Impossible de charger les banques');
          }
        } catch (error) {
          console.error('Error loading banks:', error);
          toast.error('Erreur lors du chargement des banques');
        } finally {
          setIsLoadingBanks(false);
        }
      };
      void loadBanks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userCountry]);

  const handlePresetAmount = (value: number): void => {
    if (value <= userBalance) {
      setSelectedAmount(value);
      setAmount(value);
      setErrors({});
    } else {
      toast.warning('Solde insuffisant pour ce montant');
    }
  };

  const handleAmountInput = (value: string): void => {
    const numValue = parseInt(value) || 0;
    setAmount(numValue);
    setSelectedAmount(null);
    setErrors({});
  };

  const handleNext = (): void => {
    const newErrors: Record<string, string> = {};

    if (step === 'amount') {
      if (!amount || amount < PLATFORM_CONFIG.minWithdrawal) {
        newErrors.amount = `Le montant minimum est ${formatCurrency(PLATFORM_CONFIG.minWithdrawal)}`;
      }
      if (amount > userBalance) {
        newErrors.amount = 'Solde insuffisant';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setStep('bank');
    } else if (step === 'bank') {
      if (!selectedBank) {
        newErrors.bank = 'Sélectionnez une banque';
      }
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Entrez votre numéro de compte';
      }
      if (!accountHolder.trim()) {
        newErrors.accountHolder = 'Entrez le titulaire du compte';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setStep('confirmation');
    }
  };

  const handleConfirm = async (): Promise<void> => {
    setStep('processing');
    setIsLoading(true);

    try {
      const withdrawalData = {
        amount,
        bank_id: selectedBank?.id || '',
        bank_name: selectedBank?.name || '',
        account_number: accountNumber,
        account_holder_name: accountHolder,
      };

      const response = await api.createWithdrawal(withdrawalData);

      if (response.success) {
        toast.success('Retrait créé avec succès!');
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        toast.error(response.error || 'Erreur lors de la création du retrait');
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast.error('Erreur lors de la création du retrait');
      setStep('confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyFeedback(id);
      toast.success('Copié!');
      setTimeout(() => setShowCopyFeedback(null), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  const { fees: withdrawalFees, netAmount } = calculateWithdrawalFees(amount);
  const currentStepIndex = STEPS.findIndex(s => s.name === step);

  const renderProgressBar = (): React.ReactNode => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((s, index) => (
          <React.Fragment key={s.name}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                  index < currentStepIndex
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                    : index === currentStepIndex
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white scale-110 shadow-lg'
                    : 'bg-slate-700 dark:bg-slate-600 text-slate-300'
                }`}
              >
                {s.emoji}
              </div>
              <span className="text-xs mt-2 text-slate-600 dark:text-slate-400 hidden sm:block">
                {s.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                  index < currentStepIndex
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                    : 'bg-slate-700 dark:bg-slate-600'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderAmountStep = (): React.ReactNode => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          💰 Sélectionnez le montant à retirer
        </h3>
        <div className="space-y-2 mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Minimum: {formatCurrency(PLATFORM_CONFIG.minWithdrawal)}
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Solde disponible: <span className="text-blue-700 dark:text-blue-300 font-bold">{formatCurrency(userBalance)}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {presetAmounts.map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetAmount(preset)}
              disabled={preset > userBalance}
              className={`p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedAmount === preset
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Ou entrez un montant personnalisé
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount || ''}
              onChange={e => handleAmountInput(e.target.value)}
              placeholder="Entrez le montant"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              FCFA
            </span>
          </div>
        </div>

        {amount > 0 && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Montant demandé:</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Frais (6%):</span>
              <span className="font-bold">-{formatCurrency(withdrawalFees)}</span>
            </div>
            <div className="border-t border-slate-300 dark:border-slate-600 pt-2 flex justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Montant net:</span>
              <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(netAmount)}</span>
            </div>
          </div>
        )}

        {errors.amount && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.amount}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBankStep = (): React.ReactNode => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          🏧 Sélectionnez votre banque de retrait
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Montant net: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(netAmount)}</span>
        </p>

        {isLoadingBanks ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {banks.length > 0 ? (
              banks.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedBank(bank);
                    setErrors({});
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedBank?.id === bank.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 dark:border-blue-400'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold text-slate-900 dark:text-white">{bank.name}</p>
                    {bank.code && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Code: {bank.code}
                      </p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-slate-600 dark:text-slate-400 py-6">
                Aucune banque disponible
              </p>
            )}
          </div>
        )}

        {selectedBank && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-lg mb-6 animate-fade-in-up">
            <div className="flex items-start gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-100">{selectedBank.name}</p>
                {selectedBank.code && (
                  <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                    Code bancaire: {selectedBank.code}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Numéro de compte
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={e => {
                setAccountNumber(e.target.value);
                setErrors({});
              }}
              placeholder="Entrez votre numéro de compte"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.accountNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Titulaire du compte
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={e => {
                setAccountHolder(e.target.value);
                setErrors({});
              }}
              placeholder="Entrez le nom complet"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {errors.accountHolder && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.accountHolder}</p>
            )}
          </div>
        </div>

        {errors.bank && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.bank}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderConfirmationStep = (): React.ReactNode => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          ✅ Confirmez votre retrait
        </h3>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Montant demandé</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300 mb-1">Frais de retrait (6%)</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(withdrawalFees)}
            </p>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-300 dark:border-green-700">
            <p className="text-sm text-green-700 dark:text-green-300 mb-1">Montant net à recevoir</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(netAmount)}
            </p>
          </div>

          {selectedBank && (
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Banque</p>
              <p className="font-bold text-slate-900 dark:text-white">{selectedBank.name}</p>
              {selectedBank.code && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Code: {selectedBank.code}
                </p>
              )}
            </div>
          )}

          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Numéro de compte</p>
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 dark:text-white">{accountNumber}</p>
              <button
                onClick={() => copyToClipboard(accountNumber, 'account')}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all transform hover:scale-110"
              >
                <Copy className={`w-4 h-4 ${showCopyFeedback === 'account' ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'}`} />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Titulaire</p>
            <p className="font-bold text-slate-900 dark:text-white">{accountHolder}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
          En cliquant sur "Confirmer", vous acceptez les conditions de retrait. Les frais de 6% seront déduits du montant demandé.
        </p>
      </div>
    </div>
  );

  const renderProcessingStep = (): React.ReactNode => (
    <div className="space-y-6 text-center">
      <div className="py-12">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <Loader className="w-16 h-16 text-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Traitement en cours...
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Votre retrait de {formatCurrency(netAmount)} est en cours de traitement
        </p>
      </div>
    </div>
  );

  const renderSuccessStep = (): React.ReactNode => (
    <div className="space-y-6 text-center">
      <div className="py-12">
        <div className="flex justify-center mb-6 animate-scale-in">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Succès! ✅
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Votre retrait de {formatCurrency(netAmount)} a été créé avec succès
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Redirection en cours...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:to-slate-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition-all transform hover:scale-110"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">💳 Retrait</h1>
          <div className="w-10" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
          {renderProgressBar()}

          {/* Steps Content */}
          <div className="min-h-[400px] mb-8">
            {step === 'amount' && renderAmountStep()}
            {step === 'bank' && renderBankStep()}
            {step === 'confirmation' && renderConfirmationStep()}
            {step === 'processing' && renderProcessingStep()}
            {step === 'success' && renderSuccessStep()}
          </div>

          {/* Actions */}
          {step !== 'processing' && step !== 'success' && (
            <div className="flex gap-3">
              {step !== 'amount' && (
                <button
                  onClick={() => {
                    const stepIndex = STEPS.findIndex(s => s.name === step);
                    if (stepIndex > 0) {
                      setStep(STEPS[stepIndex - 1].name as StepType);
                      setErrors({});
                    }
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-all transform hover:scale-105 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Précédent
                </button>
              )}
              {step !== 'confirmation' && (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Suivant
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
              {step === 'confirmation' && (
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmer le retrait
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalForm;
