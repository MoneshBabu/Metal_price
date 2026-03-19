export interface MetalData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  prevOpen: number;
  prevClose: number;
  timestamp: string;
  date: string;
  unit: string;
  currency: string;
  purity?: string;
  history: { time: string; price: number }[];
}

export const METALS = [
  { id: 'gold', name: 'Gold', symbol: 'XAU' },
  { id: 'silver', name: 'Silver', symbol: 'XAG' },
  { id: 'platinum', name: 'Platinum', symbol: 'XPT' },
  { id: 'palladium', name: 'Palladium', symbol: 'XPD' },
];
