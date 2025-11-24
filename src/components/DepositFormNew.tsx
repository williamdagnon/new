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

export const DepositForm: React.FC<DepositFormProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'amount' | 'payment' | 'bank' | 'confirmation' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (step === 'bank') {
      void (async () => {
        try {
          const res = await api.getBanks();
          if (res?.success) setBanks(res.data || []);
        } catch (err) {
          console.error(err);
          toast.error('Impossible de charger les banques');
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleConfirm = async () => {
    setStep('processing');
    setLoading(true);
    try {
      const res = await api.createDeposit({ amount, payment_method: paymentMethod, account_number: accountNumber, bank_id: selectedBank?.id });
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
      setLoading(false);
    }
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
          <div className="mt-3 flex gap-2">
            <button className="flex-1 bg-green-500 text-white p-2 rounded" onClick={() => setStep('payment')}>Suivant</button>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div>
          {PAYMENT_METHODS.map(m => (
            <button key={m} onClick={() => { setPaymentMethod(m); setStep('bank'); }} className="w-full p-2 mb-2 border rounded" >{m}</button>
          ))}
        </div>
      )}

      {step === 'bank' && (
        <div>
          {banks.map(b => (
            <div key={b.id} className={`p-2 border rounded mb-2 ${selectedBank?.id === b.id ? 'bg-slate-100' : ''}`} onClick={() => setSelectedBank(b)}>
              <div className="font-medium">{b.name}</div>
              {b.code && <div className="text-sm">Num: {b.code}</div>}
            </div>
          ))}
          <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 border rounded mt-2" placeholder="Numéro de compte" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => setStep('payment')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={() => setStep('confirmation')} className="flex-1 bg-green-500 text-white p-2 rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div>
          <div className="p-3 border rounded mb-3">
            <div>Montant: {formatCurrency(amount)}</div>
            <div>Banque: {selectedBank?.name}</div>
            {selectedBank?.code && <div>Num: {selectedBank.code} <button onClick={() => navigator.clipboard.writeText(selectedBank.code)}>Copier</button></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('bank')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={handleConfirm} className="flex-1 bg-green-600 text-white p-2 rounded">Confirmer</button>
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
