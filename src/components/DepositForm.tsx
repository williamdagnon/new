import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Copy, Loader } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { PLATFORM_CONFIG, PAYMENT_METHODS } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { getBanks } from '../utils/bankService';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  userBalance?: number;
  userCountry?: string;
}

type Step = 'amount' | 'payment' | 'bank' | 'confirmation' | 'processing' | 'success';

const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000];

const DepositForm: React.FC<Props> = ({ onBack, onSuccess, userBalance = 0, userCountry }) => {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    if (step === 'bank') {
      setLoadingStep(true);
      getBanks(userCountry)
        .then(bs => setBanks(bs))
        .catch(err => { console.error(err); toast.error('Impossible de charger les banques'); })
        .finally(() => setLoadingStep(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userCountry]);

  const next = () => {
    if (step === 'amount') {
      if (!amount || amount < PLATFORM_CONFIG.minDeposit) { toast.error(`Montant minimum ${formatCurrency(PLATFORM_CONFIG.minDeposit)}`); return; }
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      if (!paymentMethod) { toast.error('Sélectionnez un mode de paiement'); return; }
      setStep('bank');
      return;
    }
    if (step === 'bank') {
      if (!selectedBank) { toast.error('Sélectionnez une banque'); return; }
      if (!accountNumber.trim()) { toast.error('Entrez votre numéro de compte'); return; }
      setStep('confirmation');
      return;
    }
  };

  const confirm = async () => {
    setStep('processing');
    setLoadingStep(true);
    try {
      const payload = { amount, payment_method: paymentMethod, account_number: accountNumber, bank_id: selectedBank?.id };
      const res = await api.createDeposit(payload);
      if (res?.success) {
        toast.success('Dépôt créé');
        setStep('success');
        setTimeout(onSuccess, 900);
      } else {
        toast.error(res?.error || 'Erreur');
        setStep('confirmation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
      setStep('confirmation');
    } finally {
      setLoadingStep(false);
    }
  };

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); toast.success('Copié'); }
    catch { toast.error('Impossible de copier'); }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack}><ArrowLeft /></button>
        <h3 className="font-bold">Dépôt</h3>
        <div style={{ width: 32 }} />
      </div>

      {step === 'amount' && (
        <div>
          <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="w-full p-2 border rounded" placeholder="Montant" />
          <div className="grid grid-cols-4 gap-2 mt-3">
            {presetAmounts.map(p => (
              <button key={p} onClick={() => setAmount(p)} className="p-2 bg-slate-100 rounded">{formatCurrency(p)}</button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep('amount')} className="flex-1 p-2 border rounded">Annuler</button>
            <button onClick={next} className="flex-1 p-2 bg-green-500 text-white rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div>
          {PAYMENT_METHODS.filter((m: any) => !m.country || m.country === userCountry).map((m: any) => (
            <button key={m.name || m} onClick={() => { setPaymentMethod(m.name || m); setTimeout(next, 150); }} className="w-full p-2 mb-2 border rounded">{m.name || m}</button>
          ))}
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep('amount')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={next} className="flex-1 p-2 bg-green-500 text-white rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'bank' && (
        <div>
          {loadingStep ? <div className="py-6 text-center"><Loader className="animate-spin mx-auto" /></div> : (
            <div>
              {banks.length ? banks.map(b => (
                <div key={b.id} onClick={() => setSelectedBank(b)} className={`p-3 mb-2 border rounded ${selectedBank?.id === b.id ? 'bg-slate-100' : ''}`}>
                  <div className="font-medium">{b.name}</div>
                  {b.deposit_number && <div className="text-sm">Num dépôt: {b.deposit_number}</div>}
                  {b.account_holder && <div className="text-sm">Titulaire: {b.account_holder}</div>}
                </div>
              )) : <div className="text-sm text-slate-500">Aucune banque trouvée pour votre pays.</div>}
            </div>
          )}
          <div className="mt-3">
            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="Votre numéro de compte" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep('payment')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={next} className="flex-1 p-2 bg-green-500 text-white rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div>
          <div className="p-3 border rounded mb-3">
            <div>Montant: {formatCurrency(amount)}</div>
            <div>Banque: {selectedBank?.name}</div>
            {selectedBank?.deposit_number && <div>Num dépôt: {selectedBank.deposit_number} <button onClick={() => copy(selectedBank.deposit_number)} className="ml-2"><Copy /></button></div>}
            {selectedBank?.account_holder && <div>Titulaire: {selectedBank.account_holder}</div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('bank')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={confirm} className="flex-1 p-2 bg-green-600 text-white rounded">Confirmer</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center p-6"><Loader className="animate-spin mx-auto" /><div>Traitement...</div></div>
      )}

      {step === 'success' && (
        <div className="text-center p-6"><CheckCircle className="text-green-500" /><div>Dépôt créé</div></div>
      )}
    </div>
  );
};

export default DepositForm;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Copy, Loader } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { PAYMENT_METHODS, PLATFORM_CONFIG } from '../constants';
import { formatCurrency } from '../utils/calculations';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Copy, Loader } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { PAYMENT_METHODS, PLATFORM_CONFIG } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { Bank } from '../types';

interface DepositFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

type StepType = 'amount' | 'payment' | 'bank' | 'confirmation' | 'processing' | 'success';

const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000, 350000, 700000];

const DepositForm: React.FC<DepositFormProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<StepType>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    if (step === 'bank') void loadBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadBanks = async (): Promise<void> => {
    setIsLoadingBanks(true);
    try {
      const res = await api.getBanks();
      if (res?.success && res.data) setBanks(res.data);
      else toast.error('Impossible de charger les banques');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des banques');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handlePreset = (v: number) => { setSelectedAmount(v); setAmount(v); setErrors({}); };

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (step === 'amount') {
      if (!amount || amount < PLATFORM_CONFIG.minDeposit) e.amount = `Le montant minimum est ${formatCurrency(PLATFORM_CONFIG.minDeposit)}`;
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      if (!paymentMethod) { e.paymentMethod = 'Sélectionnez un mode de paiement'; setErrors(e); return; }
      setStep('bank');
      return;
    }
    if (step === 'bank') {
      if (!selectedBank) e.bank = 'Sélectionnez une banque';
      if (!accountNumber.trim()) e.accountNumber = 'Entrez votre numéro de compte';
      if (Object.keys(e).length) { setErrors(e); return; }
      setStep('confirmation');
    }
  };

  const handleConfirm = async () => {
    setStep('processing');
    setIsLoading(true);
    try {
      const payload = { amount, payment_method: paymentMethod, account_number: accountNumber, bank_id: selectedBank?.id };
      const res = await api.createDeposit(payload);
      if (res?.success) {
        toast.success('Dépôt créé');
        setStep('success');
        setTimeout(onSuccess, 900);
      } else {
        toast.error(res?.error || 'Erreur');
        setStep('confirmation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
      setStep('confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      toast.success('Copié');
    } catch {
      toast.error('Impossible de copier');
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 rounded-lg"><ArrowLeft className="w-6 h-6" /></button>
          <h2 className="text-lg font-bold">Dépôt</h2>
          <div className="w-8" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow">
          {step === 'amount' && (
            <div className="space-y-4">
              <p className="text-sm">Montant (minimum {formatCurrency(PLATFORM_CONFIG.minDeposit)})</p>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map(p => (
                  <button key={p} onClick={() => handlePreset(p)} className={`p-2 rounded ${selectedAmount === p ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
              <input type="number" value={amount || ''} onChange={e => { setAmount(Number(e.target.value)); setSelectedAmount(null); }} className="w-full p-3 border rounded" placeholder="Montant personnalisé" />
              {errors.amount && <div className="text-sm text-red-600">{errors.amount}</div>}
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <p className="text-sm">Mode de paiement</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => { setPaymentMethod(m); setErrors({}); }} className={`w-full p-3 rounded ${paymentMethod === m ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {errors.paymentMethod && <div className="text-sm text-red-600">{errors.paymentMethod}</div>}
            </div>
          )}

          {step === 'bank' && (
            <div className="space-y-4">
              <p className="text-sm">Choisissez une banque</p>
              {isLoadingBanks ? (
                <div className="flex justify-center py-6"><Loader className="animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {banks.length ? banks.map(b => (
                    <button key={b.id} onClick={() => { setSelectedBank(b); setErrors({}); }} className={`w-full p-3 rounded ${selectedBank?.id === b.id ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{b.name}</div>
                          {b.code && <div className="text-sm text-slate-500">Num: {b.code}</div>}
                        </div>
                        <div className="text-sm">{selectedBank?.id === b.id ? 'Sélectionné' : ''}</div>
                      </div>
                    </button>
                  )) : <div className="text-sm text-slate-500">Aucune banque</div>}
                </div>
              )}

              <div>
                <label className="text-sm">Votre numéro de compte</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-3 border rounded mt-1" placeholder="Numéro de compte" />
                {errors.accountNumber && <div className="text-sm text-red-600">{errors.accountNumber}</div>}
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm">Montant</div>
                <div className="font-bold">{formatCurrency(amount)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm">Banque</div>
                <div className="font-bold">{selectedBank?.name || '-'}</div>
                {selectedBank?.code && <div className="text-sm">Num: {selectedBank.code} <button onClick={() => copyText(selectedBank.code)} className="ml-2"><Copy className="w-4 h-4" /></button></div>}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader className="animate-spin mx-auto" />
              <div className="mt-2">Traitement en cours...</div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div className="mt-2">Dépôt créé avec succès</div>
            </div>
          )}

          {step !== 'processing' && step !== 'success' && (
            <div className="flex gap-2 mt-6">
              {step !== 'amount' && <button onClick={() => setStep(prev => prev === 'payment' ? 'amount' : prev === 'bank' ? 'payment' : 'bank')} className="flex-1 p-3 border rounded">Précédent</button>}
              {step !== 'confirmation' && <button onClick={handleNext} className="flex-1 p-3 bg-green-500 text-white rounded">Suivant</button>}
              {step === 'confirmation' && <button onClick={handleConfirm} className="flex-1 p-3 bg-green-600 text-white rounded">Confirmer</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositForm;
      void loadBanks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadBanks = async (): Promise<void> => {
    setIsLoadingBanks(true);
    try {
      const res = await api.getBanks();
      if (res.success && res.data) setBanks(res.data);
      else toast.error('Impossible de charger les banques');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des banques');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handlePreset = (v: number) => {
    setSelectedAmount(v);
    setAmount(v);
    setErrors({});
  };

  const handleNext = () => {
    const e: Record<string, string> = {};
    if (step === 'amount') {
      if (!amount || amount < PLATFORM_CONFIG.minDeposit) e.amount = `Le montant minimum est ${formatCurrency(PLATFORM_CONFIG.minDeposit)}`;
      if (Object.keys(e).length) return setErrors(e);
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      if (!paymentMethod) { e.paymentMethod = 'Sélectionnez un mode de paiement'; setErrors(e); return; }
      setStep('bank');
      return;
    }
    if (step === 'bank') {
      if (!selectedBank) e.bank = 'Sélectionnez une banque';
      if (!accountNumber.trim()) e.accountNumber = 'Entrez votre numéro de compte';
      if (Object.keys(e).length) return setErrors(e);
      setStep('confirmation');
    }
  };

  const handleConfirm = async () => {
    setStep('processing');
    setIsLoading(true);
    try {
      const payload = { amount, payment_method: paymentMethod, account_number: accountNumber };
      const res = await api.createDeposit(payload);
      if (res.success) {
        toast.success('Dépôt créé');
        setStep('success');
        setTimeout(onSuccess, 1400);
      } else {
        toast.error(res.error || 'Erreur');
        setStep('confirmation');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création');
      setStep('confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const copy = async (t: string, id: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setShowCopyFeedback(id);
      toast.success('Copié');
      setTimeout(() => setShowCopyFeedback(null), 1500);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 rounded-lg">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold">Dépôt</h2>
          <div className="w-8" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow">
          {/* Step: amount */}
          {step === 'amount' && (
            <div className="space-y-4">
              <p className="text-sm">Montant (minimum {formatCurrency(PLATFORM_CONFIG.minDeposit)})</p>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map(p => (
                  <button key={p} onClick={() => handlePreset(p)} className={`p-2 rounded ${selectedAmount === p ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
              <input type="number" value={amount || ''} onChange={e => { setAmount(Number(e.target.value)); setSelectedAmount(null); }} className="w-full p-3 border rounded" placeholder="Montant personnalisé" />
              {errors.amount && <div className="text-sm text-red-600">{errors.amount}</div>}
            </div>
          )}

          {/* Step: payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <p className="text-sm">Mode de paiement</p>
              <div className="space-y-2">
                {PAYMENT_METHODS.map(m => (
                  <button key={m} onClick={() => { setPaymentMethod(m); setErrors({}); }} className={`w-full p-3 rounded ${paymentMethod === m ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                    {m}
                  </button>
                ))}
              </div>
              {errors.paymentMethod && <div className="text-sm text-red-600">{errors.paymentMethod}</div>}
            </div>
          )}

          {/* Step: bank */}
          {step === 'bank' && (
            <div className="space-y-4">
              <p className="text-sm">Choisissez une banque</p>
              {isLoadingBanks ? (
                <div className="flex justify-center py-6"><Loader className="animate-spin" /></div>
              ) : (
                <div className="space-y-2">
                  {banks.length ? banks.map(b => (
                    <button key={b.id} onClick={() => { setSelectedBank(b); setErrors({}); }} className={`w-full p-3 rounded ${selectedBank?.id === b.id ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{b.name}</div>
                          {b.code && <div className="text-sm text-slate-500">Num: {b.code}</div>}
                        </div>
                        <div className="text-sm">{selectedBank?.id === b.id ? 'Sélectionné' : ''}</div>
                      </div>
                    </button>
                  )) : <div className="text-sm text-slate-500">Aucune banque</div>}
                </div>
              )}

              <div>
                <label className="text-sm">Votre numéro de compte</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-3 border rounded mt-1" placeholder="Numéro de compte" />
                {errors.accountNumber && <div className="text-sm text-red-600">{errors.accountNumber}</div>}
              </div>
            </div>
          )}

          {/* Step: confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm">Montant</div>
                <div className="font-bold">{formatCurrency(amount)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded">
                <div className="text-sm">Banque</div>
                <div className="font-bold">{selectedBank?.name || '-'}</div>
                {selectedBank?.code && <div className="text-sm">Num: {selectedBank.code} <button onClick={() => copy(selectedBank.code, 'bank')} className="ml-2"><Copy className="w-4 h-4" /></button></div>}
              </div>
            </div>
          )}

          {/* Step: processing */}
          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader className="animate-spin mx-auto" />
              <div className="mt-2">Traitement en cours...</div>
            </div>
          )}

          {/* Step: success */}
          {step === 'success' && (
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div className="mt-2">Dépôt créé avec succès</div>
            </div>
          )}

          {/* Actions */}
          {step !== 'processing' && step !== 'success' && (
            <div className="flex gap-2 mt-6">
              {step !== 'amount' && <button onClick={() => setStep(prev => prev === 'payment' ? 'amount' : prev === 'bank' ? 'payment' : 'bank')} className="flex-1 p-3 border rounded">Précédent</button>}
              {step !== 'confirmation' && <button onClick={handleNext} className="flex-1 p-3 bg-green-500 text-white rounded">Suivant</button>}
              {step === 'confirmation' && <button onClick={handleConfirm} className="flex-1 p-3 bg-green-600 text-white rounded">Confirmer</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositForm;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Copy, Loader, ChevronRight, Info } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { PAYMENT_METHODS, PLATFORM_CONFIG } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { Bank } from '../types';

interface DepositFormProps {
  onBack: () => void;
  onSuccess: () => void;
  userBalance?: number;
}

type StepType = 'amount' | 'payment' | 'bank' | 'confirmation' | 'processing' | 'success';

interface StepConfig {
  name: StepType;
  label: string;
  emoji: string;
}

const STEPS: StepConfig[] = [
  { name: 'amount', label: 'Montant', emoji: '💰' },
  { name: 'payment', label: 'Paiement', emoji: '🏦' },
  { name: 'bank', label: 'Banque', emoji: '🏧' },
  { name: 'confirmation', label: 'Confirmer', emoji: '✅' },
  { name: 'processing', label: 'Traitement', emoji: '⏳' },
  { name: 'success', label: 'Succès', emoji: '✅' },
];

export const DepositForm: React.FC<DepositFormProps> = ({ onBack, onSuccess, userBalance = 0 }) => {
  const [step, setStep] = useState<StepType>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCopyFeedback, setShowCopyFeedback] = useState<string | null>(null);
  const toast = useToast();

  const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000, 350000, 700000];

  useEffect(() => {
    if (step === 'bank') {
      loadBanks();
    }
  }, [step]);

  const loadBanks = async (): Promise<void> => {
    setIsLoadingBanks(true);
    try {
      const response = await api.getBanks();
      if (response.success && response.data) {
        setBanks(response.data);
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

  const handlePresetAmount = (value: number): void => {
    setSelectedAmount(value);
    setAmount(value);
    setErrors({});
  };
      }
  export const DepositForm: React.FC<DepositFormProps> = ({ onBack, onSuccess }) => {
    const [step, setStep] = useState<StepType>('amount');
    const [amount, setAmount] = useState<number>(0);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCopyFeedback, setShowCopyFeedback] = useState<string | null>(null);
    const toast = useToast();

    const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000, 350000, 700000];

    const loadBanks = async (): Promise<void> => {
      setIsLoadingBanks(true);
      try {
        const response = await api.getBanks();
        if (response.success && response.data) {
          setBanks(response.data);
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

    useEffect(() => {
      if (step === 'bank') {
        void loadBanks();
      }
    }, [step]);
      setStep('confirmation');
    }
  };

  const handleConfirm = async (): Promise<void> => {
    setStep('processing');
    setIsLoading(true);

    try {
      const depositData = {
        amount,
        payment_method: paymentMethod,
        account_number: accountNumber,
        transaction_id: transactionId || undefined,
      };

      const response = await api.createDeposit(depositData);

      if (response.success) {
        toast.success('Dépôt créé avec succès!');
        setStep('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        toast.error(response.error || 'Erreur lors de la création du dépôt');
        setStep('confirmation');
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast.error('Erreur lors de la création du dépôt');
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                    : index === currentStepIndex
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white scale-110 shadow-lg'
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
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
          💰 Sélectionnez le montant
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Minimum: {formatCurrency(PLATFORM_CONFIG.minDeposit)}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {presetAmounts.map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetAmount(preset)}
              className={`p-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedAmount === preset
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
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
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">
              FCFA
            </span>
          </div>
        </div>

        {errors.amount && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.amount}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPaymentStep = (): React.ReactNode => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          🏦 Sélectionnez le mode de paiement
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Montant: <span className="font-bold text-green-500">{formatCurrency(amount)}</span>
        </p>

        <div className="space-y-3">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method}
              onClick={() => {
                setPaymentMethod(method);
                setErrors({});
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 flex items-center justify-between group ${
                paymentMethod === method
                  ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700 dark:border-green-400'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-green-400 dark:hover:border-green-500'
              }`}
            >
              <span className="font-medium text-slate-900 dark:text-white">{method}</span>
              <ChevronRight className={`w-5 h-5 transition-all ${paymentMethod === method ? 'text-green-500 translate-x-1' : 'text-slate-400'}`} />
            </button>
          ))}
        </div>

        {errors.paymentMethod && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.paymentMethod}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBankStep = (): React.ReactNode => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          🏧 Sélectionnez votre banque
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Résumé: {formatCurrency(amount)} via {paymentMethod}
        </p>

        {isLoadingBanks ? (
          <div className="flex justify-center py-8">
            <Loader className="w-8 h-8 text-green-500 animate-spin" />
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
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700 dark:border-green-400'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-green-400 dark:hover:border-green-500'
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
                    Numéro bancaire: {selectedBank.code}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Votre numéro de compte
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={e => {
              setAccountNumber(e.target.value);
              setErrors({});
            }}
            placeholder="Entrez votre numéro de compte"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {errors.accountNumber && (
          <div className="mt-3 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-300">{errors.accountNumber}</p>
          </div>
        )}

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
          ✅ Confirmez votre dépôt
        </h3>

        <div className="space-y-3 mb-6">
          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Montant</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(amount)}
            </p>
          </div>

          <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Mode de paiement</p>
            <p className="font-bold text-slate-900 dark:text-white">{paymentMethod}</p>
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
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
          En cliquant sur "Confirmer", vous acceptez les conditions de paiement de notre plateforme.
        </p>
      </div>
    </div>
  );

  const renderProcessingStep = (): React.ReactNode => (
    <div className="space-y-6 text-center">
      <div className="py-12">
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <Loader className="w-16 h-16 text-green-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Traitement en cours...
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Votre dépôt de {formatCurrency(amount)} est en cours de traitement
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
          Votre dépôt de {formatCurrency(amount)} a été créé avec succès
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
          <h1 className="text-2xl font-bold text-white">💰 Dépôt</h1>
          <div className="w-10" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
          {renderProgressBar()}

          {/* Steps Content */}
          <div className="min-h-[400px] mb-8">
            {step === 'amount' && renderAmountStep()}
            {step === 'payment' && renderPaymentStep()}
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirmer le dépôt
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

export default DepositForm;
