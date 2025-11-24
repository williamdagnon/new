import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { useToast } from './ToastContainer';
import api from '../utils/api';
import { PLATFORM_CONFIG } from '../constants';
import { formatCurrency } from '../utils/calculations';
import { getBanks } from '../utils/bankService';

interface Props {
  onBack: () => void;
  onSuccess: () => void;
  userBalance?: number;
  userCountry?: string;
}

type Step = 'amount' | 'bank' | 'confirmation' | 'processing' | 'success';

const presetAmounts = [3000, 6000, 15000, 30000, 65000, 150000];

const WithdrawalForm: React.FC<Props> = ({ onBack, onSuccess, userBalance = 0, userCountry }) => {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number>(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (step === 'bank') {
      setLoadingBanks(true);
      getBanks(userCountry)
        .then(bs => setBanks(bs))
        .catch(err => { console.error(err); toast.error('Impossible de charger les banques'); })
        .finally(() => setLoadingBanks(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userCountry]);

  const next = () => {
    if (step === 'amount') {
      if (!amount || amount < PLATFORM_CONFIG.minWithdrawal) { toast.error(`Montant minimum ${formatCurrency(PLATFORM_CONFIG.minWithdrawal)}`); return; }
      if (amount > userBalance) { toast.error('Solde insuffisant'); return; }
      setStep('bank');
      return;
    }
    if (step === 'bank') {
      if (!selectedBank) { toast.error('Sélectionnez une banque'); return; }
      if (!accountNumber.trim()) { toast.error('Entrez le numéro de compte'); return; }
      if (!accountHolder.trim()) { toast.error('Entrez le titulaire'); return; }
      setStep('confirmation');
      return;
    }
  };

  const confirm = async () => {
    setStep('processing');
    setLoading(true);
    try {
      const res = await api.createWithdrawal({ amount, bank_id: selectedBank?.id, account_number: accountNumber, account_holder_name: accountHolder });
      if (res?.success) {
        toast.success('Retrait créé');
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
        <h3 className="font-bold">Retrait</h3>
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
            <button onClick={next} className="flex-1 p-2 bg-blue-500 text-white rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'bank' && (
        <div>
          {loadingBanks ? <div className="py-6 text-center"><Loader className="animate-spin mx-auto" /></div> : (
            <div>
              {banks.length ? banks.map(b => (
                <div key={b.id} onClick={() => setSelectedBank(b)} className={`p-3 mb-2 border rounded ${selectedBank?.id === b.id ? 'bg-slate-100' : ''}`}>
                  <div className="font-medium">{b.name}</div>
                  {b.code && <div className="text-sm">Code: {b.code}</div>}
                  {b.deposit_number && <div className="text-sm">Num dépôt: {b.deposit_number}</div>}
                </div>
              )) : <div className="text-sm text-slate-500">Aucune banque trouvée pour votre pays.</div>}
            </div>
          )}

          <div className="mt-3">
            <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 border rounded" placeholder="Numéro de compte" />
            <input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="w-full p-2 border rounded mt-2" placeholder="Titulaire du compte" />
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setStep('amount')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={next} className="flex-1 p-2 bg-blue-500 text-white rounded">Suivant</button>
          </div>
        </div>
      )}

      {step === 'confirmation' && (
        <div>
          <div className="p-3 border rounded mb-3">
            <div>Montant: {formatCurrency(amount)}</div>
            <div>Banque: {selectedBank?.name}</div>
            {selectedBank?.deposit_number && <div>Num dépôt: {selectedBank.deposit_number}</div>}
            <div>Titulaire: {accountHolder}</div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setStep('bank')} className="flex-1 p-2 border rounded">Précédent</button>
            <button onClick={confirm} className="flex-1 p-2 bg-blue-600 text-white rounded">Confirmer</button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center p-6"><Loader className="animate-spin mx-auto" /><div>Traitement...</div></div>
      )}

      {step === 'success' && (
        <div className="text-center p-6"><CheckCircle className="text-green-500" /><div>Retrait créé</div></div>
      )}
    </div>
  );
};

export default WithdrawalForm;
