
export interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number; // For demo purposes, we can simulate conversion if needed
}

export interface Activity {
  id: string;
  name: string;
  type: 'Sightseeing' | 'Food' | 'Transport' | 'Stay' | 'Other';
  cost: number;
  actualCost?: number; // Real amount spent
  duration: string;
  time?: string;
}

export interface CityStop {
  id: string;
  cityName: string;
  country: string;
  startDate: string;
  endDate: string;
  activities: Activity[];
  image?: string; // Automatically fetched place image
}

export type TripCategory = 'Solo' | 'Couple' | 'Family' | 'Friends';

export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  cities: CityStop[];
  totalBudget: number;
  currencyCode?: string;
  adultsCount: number;
  childrenCount: number;
  category: TripCategory;
  image?: string; // Base64 or URL for the banner image
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  activities: number;
  food: number;
}
