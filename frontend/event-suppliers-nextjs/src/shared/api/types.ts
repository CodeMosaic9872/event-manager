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
export type UpsertSupplierProfilePayload = {
  businessName: string;
  slug?: string;
  description?: string;
};
export type UpdateSupplierServiceAreasPayload = { serviceAreas: string[] };
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
