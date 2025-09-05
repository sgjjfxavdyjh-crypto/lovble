export interface Billboard {
  id: string;
  name: string;
  location: string;
  size: string;
  price: number;
  installationPrice?: number;
  status: 'available' | 'rented' | 'maintenance';
  city: string;
  coordinates?: { lat: number; lng: number } | string;
  image?: string;
  description?: string;
  contractNumber?: string;
  clientName?: string;
  expiryDate?: string;
  nearExpiry?: boolean;
  remainingDays?: number;
  adType?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  company?: string;
}

export interface Booking {
  id: string;
  userId: string;
  billboards: Billboard[];
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface PricingTier {
  size: string;
  price: number;
  installationPrice: number;
}
