import api from './api';

let cache: { [country: string]: any[] } = {};

export async function getBanks(country?: string) {
  const key = country || '__all__';
  if (cache[key]) return cache[key];
  try {
    const res = await api.getBanks();
    const banks = (res && res.data) || [];
    // If backend supports filtering by country it's better; otherwise filter here
    const filtered = country ? banks.filter((b: any) => (b.country || '').toLowerCase() === country.toLowerCase()) : banks;
    cache[key] = filtered;
    return filtered;
  } catch (err) {
    console.error('bankService.getBanks error', err);
    return [];
  }
}

export function clearBankCache() {
  cache = {};
}
