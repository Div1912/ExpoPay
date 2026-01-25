const MOCK_RATES: Record<string, number> = {
  'XLM_INR': 13.52,
  'XLM_USD': 0.16,
  'XLM_EUR': 0.15,
  'XLM_GBP': 0.13,
  'USDC_INR': 83.50,
  'USDC_USD': 1.00,
  'USDC_EUR': 0.92,
  'USDC_GBP': 0.79,
  'INR_XLM': 0.074,
  'INR_USDC': 0.012,
  'USD_INR': 83.50,
  'EUR_INR': 90.80,
  'GBP_INR': 105.60,
};

export type SupportedCurrency = 'XLM' | 'USDC' | 'INR' | 'USD' | 'EUR' | 'GBP';

export interface FXQuote {
  id?: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  source_amount: number;
  target_amount: number;
  expires_at: string;
  seconds_remaining: number;
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;
  
  const key = `${from}_${to}`;
  const reverseKey = `${to}_${from}`;
  
  if (MOCK_RATES[key]) {
    const variance = (Math.random() - 0.5) * 0.002;
    return MOCK_RATES[key] * (1 + variance);
  }
  
  if (MOCK_RATES[reverseKey]) {
    return 1 / (MOCK_RATES[reverseKey] * (1 + (Math.random() - 0.5) * 0.002));
  }
  
  return 1;
}

export async function convertAmount(amount: number, from: string, to: string): Promise<number> {
  const rate = await getExchangeRate(from, to);
  return amount * rate;
}

export async function generateQuote(
  fromCurrency: string,
  toCurrency: string,
  sourceAmount: number,
  expirySeconds: number = 45
): Promise<FXQuote> {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  const targetAmount = sourceAmount * rate;
  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  return {
    from_currency: fromCurrency,
    to_currency: toCurrency,
    rate,
    source_amount: sourceAmount,
    target_amount: targetAmount,
    expires_at: expiresAt.toISOString(),
    seconds_remaining: expirySeconds,
  };
}

export function isQuoteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    XLM: '',
    USDC: '$',
  };
  
  const symbol = symbols[currency] || '';
  const decimals = ['INR', 'XLM'].includes(currency) ? 2 : 2;
  
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function getSupportedCurrencies() {
  return [
    { code: 'USDC', name: 'USD Coin', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
  ];
}
