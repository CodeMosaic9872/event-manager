export type UserRole = "guest" | "user" | "supplier" | "admin";

export type AuthUser = {
  id: string;
  email: string;
  roles: UserRole[];
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
  avatarUrl?: string;
  heroBannerUrl?: string;
  gallery?: string[];
  reviews?: Array<{
    id: string;
    author: string;
    dateLabel: string;
    body: string;
    badgeLabel?: string;
  }>;
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
