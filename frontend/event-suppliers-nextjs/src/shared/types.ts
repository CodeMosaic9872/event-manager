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
};

export type JobSummaryResponse = {
  id: string;
  title: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
};
