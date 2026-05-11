export type UserRole = "guest" | "user" | "supplier" | "admin";

export type MarketplaceProfile = {
  id: string;
  slug: string;
  businessName: string;
  description: string;
  email?: string | null;
  category?: string | null;
  subcategory?: string | null;
  city?: string | null;
  ratingAvg?: number | null;
  reviewCount?: number;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  avatarImageUrl?: string | null;
  coverImageUrl?: string | null;
  gallery?: string[];
  kosher?: string | null;
  form3010?: string | null;
  socialLinks?: Array<{ platform: string; url: string }>;
  subcategories?: string[];
  serviceAreas?: string[];
  labelsRules?: string[];
  labelsNiche?: string[];
  address?: string | null;
  extraLanguage?: string | null;
  similar?: Array<{
    id: string;
    businessName: string;
    ratingAvg: number;
    avatarUrl?: string;
  }>;
};

export type AuthUser = {
  id: string;
  email: string;
  roles: UserRole[];
  avatarImageUrl?: string | null;
  coverImageUrl?: string | null;
  supplier?: any | null;
  marketplaceProfile?: MarketplaceProfile | null;
};

export type Supplier = {
  id: string;
  businessName: string;
  slug?: string;
  ratingAvg?: number;
  category?: string;
  subcategory?: string;
  city?: string;
  rating?: number;
  tags?: string[];
  phone?: string;
  whatsapp?: string;
  description: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};

export type SuppliersListResponse = {
  items: Array<{ id: string; businessName: string; ratingAvg: number }>;
  nextCursor: string | null;
  facets: Record<string, unknown>;
};

export type SupplierProfileResponse = {
  id: string;
  slug: string;
  businessName: string;
  description: string;
  email?: string;
  category?: string;
  subcategory?: string;
  city?: string;
  ratingAvg?: number;
  reviewCount?: number;
  phone?: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  avatarImageUrl?: string;
  coverImageUrl?: string;
  gallery?: string[];
  kosher?: string;
  form3010?: string;
  subcategories?: string[];
  serviceAreas?: string[];
  labelsRules?: string[];
  labelsNiche?: string[];
  address?: string;
  extraLanguage?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  similar?: Array<{
    id: string;
    businessName: string;
    ratingAvg: number;
    avatarUrl?: string;
  }>;
};

export type JobSummaryResponse = {
  id: string;
  title: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  eventTypeId?: string;
  locationText?: string;
  category?: string;
  eventDate?: string;
  description?: string;
  isMine?: boolean;
  /** @deprecated use locationText */
  location?: string;
  /** @deprecated not available in latest API */
  audienceLabel?: string;
};
