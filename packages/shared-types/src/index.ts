// ============================================
// Connec'Kër - Types partagés
// ============================================

// --- Enums ---

export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio' | 'land' | 'office' | 'commercial';
export type TransactionType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'pending' | 'published' | 'expired' | 'rejected';
export type UserRole = 'visitor' | 'user' | 'announcer' | 'admin';
export type LeadStatus = 'new' | 'read' | 'contacted' | 'closed';

// --- User ---

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

// --- Property ---

export interface Property {
  id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  transaction_type: TransactionType;
  status: PropertyStatus;
  price: number;
  currency: string;
  surface_area: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
  address: string;
  city: string;
  district?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  features: string[];
  images: PropertyImage[];
  announcer_id: string;
  announcer?: User;
  views_count: number;
  leads_count: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  order: number;
}

// --- Lead ---

export interface Lead {
  id: string;
  property_id: string;
  property?: Property;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  message: string;
  status: LeadStatus;
  created_at: string;
}

// --- Favorite ---

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  property?: Property;
  created_at: string;
}

// --- Search ---

export interface SearchFilters {
  query?: string;
  city?: string;
  district?: string;
  country?: string;
  transaction_type?: TransactionType;
  property_type?: PropertyType[];
  price_min?: number;
  price_max?: number;
  surface_min?: number;
  surface_max?: number;
  rooms_min?: number;
  bedrooms_min?: number;
  features?: string[];
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'surface_desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  total_pages: number;
}

// --- Stats (Admin) ---

export interface DashboardStats {
  total_properties: number;
  total_users: number;
  total_leads: number;
  pending_properties: number;
  properties_by_type: Record<PropertyType, number>;
  leads_by_month: { month: string; count: number }[];
}
