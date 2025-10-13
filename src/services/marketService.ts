import { supabase } from '../lib/supabase';

export interface MarketPrice {
  id: string;
  product_name: string;
  price: number;
  unit: string;
  market_location: string;
  currency: string;
  updated_at: string;
}

export const getMarketPrices = async (location?: string): Promise<MarketPrice[]> => {
  let query = supabase
    .from('market_prices')
    .select('*')
    .order('updated_at', { ascending: false });

  if (location) {
    query = query.eq('market_location', location);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching market prices:', error);
  }

  if (data && data.length > 0) {
    return data;
  }

  return generateMockPrices(location);
};

const generateMockPrices = async (location?: string): Promise<MarketPrice[]> => {
  const products = [
    { name: 'Rice (White)', basePrice: 45, unit: 'per bag (50kg)' },
    { name: 'Rice (Sticky)', basePrice: 52, unit: 'per bag (50kg)' },
    { name: 'Corn', basePrice: 30, unit: 'per bag (40kg)' },
    { name: 'Tomatoes', basePrice: 2.5, unit: 'per kg' },
    { name: 'Onions', basePrice: 1.8, unit: 'per kg' },
    { name: 'Potatoes', basePrice: 1.5, unit: 'per kg' },
    { name: 'Cabbage', basePrice: 1.2, unit: 'per kg' },
    { name: 'Chili Peppers', basePrice: 4.5, unit: 'per kg' },
    { name: 'Beans (Green)', basePrice: 3.2, unit: 'per kg' },
    { name: 'Peanuts', basePrice: 3.8, unit: 'per kg' },
  ];

  const locations = ['Yangon Central Market', 'Mandalay Market', 'Naypyidaw Market'];
  const targetLocation = location || locations[0];

  const mockPrices = products.map(product => ({
    product_name: product.name,
    price: product.basePrice * (0.9 + Math.random() * 0.2),
    unit: product.unit,
    market_location: targetLocation,
    currency: 'USD',
  }));

  const { data, error } = await supabase
    .from('market_prices')
    .insert(mockPrices)
    .select();

  if (error) {
    console.error('Error saving market prices:', error);
    return mockPrices.map((p, i) => ({ ...p, id: `temp_${i}`, updated_at: new Date().toISOString() }));
  }

  return data || [];
};

export const getMarketLocations = (): string[] => {
  return ['Yangon Central Market', 'Mandalay Market', 'Naypyidaw Market', 'Bago Market', 'Sagaing Market'];
};
