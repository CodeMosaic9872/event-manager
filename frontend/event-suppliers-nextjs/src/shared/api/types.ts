import type {
  AuthTokensResponse,
  AuthUser,
  JobSummaryResponse,
  Supplier,
  SupplierProfileResponse,
  SuppliersListResponse,
} from "@/shared/types";

export type LoginPayload = { email?: string; phone?: string; code: string };
export type RegisterPayload = {
  email?: string;
  phone?: string;
  role?: "USER" | "SUPPLIER" | "ADMIN";
  fullName?: string;
  companyName?: string;
};
export type RefreshPayload = { token: string };
export type RequestOtpPayload = { phone?: string; email?: string; purpose: "register" | "login" };
export type RequestOtpResponse = { sent: boolean; message: string; mode: string; expiresAt: string };
export type VerifyOtpPayload = { phone?: string; email?: string; code: string; purpose: "register" | "login" };
export type VerifyOtpResponse = { verified: boolean; message: string };
export type SuppliersQuery = {
  q?: string;
  eventTypeId?: string;
  categoryId?: string;
  subcategoryId?: string;
  locationRegionCode?: string;
  minRating?: number;
  take?: number;
  cursor?: string;
  /** Comma-separated keys: mod,reservist,insurance,shabbat */
  general?: string;
  /** Comma-separated keys: mehadrin,accessible,parking,disability,outdoor */
  niche?: string;
  /** Extra spoken language code, e.g. en */
  lang?: string;
};
export type CreateJobPayload = {
  title: string;
  description: string;
  eventDate?: string;
  eventTypeId?: string;
  locationText?: string;
  budgetMin?: number;
  budgetMax?: number;
  guestCount?: number;
};
export type UpdateJobPayload = Partial<CreateJobPayload & { status?: string }>;
/** `POST /v1/jobs/:id/applications` (supplier apply) */
export type ApplyToJobPayload = {
  jobId: string;
  message?: string;
};
export type JobApplication = {
  id: string;
  jobId: string;
  supplierId: string;
  supplierName: string;
  supplierRating?: number;
  supplierReviewCount?: number;
  price?: number;
  message?: string;
  status?: string;
};
export type CreateReviewPayload = { rating: number; title?: string; comment?: string };
export type UpdateReviewPayload = { rating?: number; title?: string; comment?: string };
export type ReviewResponse = {
  id: string;
  supplierId: string;
  authorUserId: string;
  author?: { id: string } | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ReviewListResponse = {
  items: ReviewResponse[];
  totalItems: number;
};
export type CreateMediaUploadUrlPayload = { fileName: string; contentType: string };
export type CreateMediaUploadUrlResponse = { uploadUrl: string; key: string; publicUrl?: string };
export type CompleteMediaUploadPayload = { key: string; mediaType: string; sortOrder?: number };
export type CompleteMediaUploadResponse = { id: string; url: string; mediaType: string };
export type SupplierCategoryAssignment = {
  categoryId: string;
  subcategoryId?: string | null;
};

export type UpsertSupplierProfilePayload = {
  businessName: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  socialLinks?: SocialLink[];
  subcategories?: string[];
  categories?: SupplierCategoryAssignment[];
  serviceAreas?: string[];
  labelsRules?: string[];
  labelsNiche?: string[];
  address?: string;
  extraLanguage?: string;
  gallery?: string[];
};

export type CreateAdminSupplierUserPayload = {
  email: string;
  phone: string;
};

export type AdminSupplierUserCreated = {
  id: string;
  email: string;
  phone: string;
  status: string;
  roles: string[];
  createdAt: string;
};

export type CreateAdminSupplierPayload = {
  ownerUserId: string;
  businessName: string;
  slug: string;
  description?: string;
  contactEmail?: string;
  publicPhone?: string;
  serviceAreas?: string[];
  approvalStatus?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
};

export type AdminSupplierCrud = {
  id: string;
  ownerUserId: string;
  businessName: string;
  slug: string;
  approvalStatus: string;
  isActive: boolean;
  isVerified: boolean;
};
export type SocialLink = { platform: string; url: string };
export type ServiceAreaItem = { regionCode: string; cityCode?: string };
export type UpdateSupplierServiceAreasPayload = { serviceAreas: ServiceAreaItem[] };
export type CreateConversationResponse = { id: string };
export type SendMessagePayload = { id: string; message: string };
export type NotificationPreferences = {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  mutedTemplates: string[];
};

export type ApiDomainTypes = {
  AuthTokensResponse: AuthTokensResponse;
  AuthUser: AuthUser;
  JobSummaryResponse: JobSummaryResponse;
  Supplier: Supplier;
  SupplierProfileResponse: SupplierProfileResponse;
  SuppliersListResponse: SuppliersListResponse;
};
