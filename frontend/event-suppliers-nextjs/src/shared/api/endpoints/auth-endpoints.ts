import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type { AuthTokensResponse, AuthUser } from "@/shared/types";
import type {
  LoginPayload,
  RefreshPayload,
  RegisterPayload,
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
  CreateMediaUploadUrlPayload,
  CreateMediaUploadUrlResponse,
  CompleteMediaUploadPayload,
  CompleteMediaUploadResponse,
} from "@/shared/api/types";

export function createAuthEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    login: builder.mutation<AuthTokensResponse, LoginPayload>({
      query: (body) => ({ url: "/v1/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthTokensResponse, RegisterPayload>({
      query: (body) => ({ url: "/v1/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    requestOtp: builder.mutation<RequestOtpResponse, RequestOtpPayload>({
      query: (body) => ({ url: "/v1/auth/request-otp", method: "POST", body }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpPayload>({
      query: (body) => ({ url: "/v1/auth/verify-otp", method: "POST", body }),
    }),
    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, RefreshPayload>({
      query: (body) => ({ url: "/v1/auth/refresh", method: "POST", body }),
    }),
    me: builder.query<AuthUser, void>({
      query: () => ({ url: "/v1/auth/me" }),
      transformResponse: (response: unknown) => {
        const r = response as any;
        const data = r?.data;
        const item = data?.items?.[0] || data;
        const s = item?.supplier;
        const rawSocialLinks: { platform: string; url: string }[] = Array.isArray(s?.socialLinks) ? s.socialLinks : [];
        const findLink = (platform: string) => rawSocialLinks.find((l) => l.platform === platform)?.url ?? null;
        const marketplaceProfile = s
          ? {
              id: s.id ?? "",
              slug: s.slug ?? "",
              businessName: s.businessName ?? "",
              description: s.description ?? "",
              email: s.contactEmail ?? null,
              category: s.categories?.[0]?.name ?? null,
              subcategory: s.categories?.[0]?.subcategory?.name ?? null,
              city: null,
              ratingAvg: s.ratingAvg ?? null,
              reviewCount: s._count?.reviews ?? 0,
              phone: s.publicPhone ?? null,
              whatsapp: s.whatsappUrl ?? null,
              website: s.websiteUrl ?? null,
              instagram: findLink("instagram"),
              facebook: findLink("facebook"),
              avatarImageUrl: s.avatarImageUrl ?? null,
              coverImageUrl: s.coverImageUrl ?? null,
              gallery: Array.isArray(s.media) ? s.media.map((m: any) => m.url) : [],
              kosher: s.attributes?.kosherOptions ?? null,
              form3010: s.form3010 ?? null,
              socialLinks: rawSocialLinks,
              subcategories: s.categories?.map((c: any) => c.subcategory?.name).filter(Boolean) ?? [],
              serviceAreas: Array.isArray(s.serviceAreas) ? s.serviceAreas : [],
              labelsRules: Array.isArray(s.attributes?.labelsRulesJson) ? s.attributes.labelsRulesJson : [],
              labelsNiche: Array.isArray(s.attributes?.labelsNicheJson) ? s.attributes.labelsNicheJson : [],
              address: s.address ?? null,
              extraLanguage: s.extraLanguage ?? null,
            }
          : null;
        return {
          id: item?.id ?? "",
          email: item?.email ?? "",
          roles: Array.isArray(item?.roles) ? item.roles.map((role: string) => role.toLowerCase() as AuthUser["roles"][number]) : [],
          avatarImageUrl: item?.avatarImageUrl ?? null,
          coverImageUrl: item?.coverImageUrl ?? null,
          supplier: item?.supplier ?? null,
          marketplaceProfile,
        } as AuthUser;
      },
      providesTags: ["Auth"],
    }),
    updateMe: builder.mutation<{ status: string }, { email?: string; avatarImageUrl?: string; coverImageUrl?: string }>({
      query: (body) => ({ url: "/v1/auth/me", method: "PATCH", body }),
      invalidatesTags: ["Auth"],
    }),
    createUserMediaUploadUrl: builder.mutation<CreateMediaUploadUrlResponse, CreateMediaUploadUrlPayload>({
      query: (body) => ({ url: "/v1/auth/me/media/upload-url", method: "POST", body }),
      transformResponse: (response: unknown) => {
        const r = response as any;
        return (r?.data ?? r) as CreateMediaUploadUrlResponse;
      },
    }),
    completeUserMediaUpload: builder.mutation<CompleteMediaUploadResponse, CompleteMediaUploadPayload>({
      query: (body) => ({ url: "/v1/auth/me/media/complete-upload", method: "POST", body }),
      transformResponse: (response: unknown) => {
        const r = response as any;
        return (r?.data ?? r) as CompleteMediaUploadResponse;
      },
    }),
    uploadUserProfileFile: builder.mutation<{ avatarImageUrl?: string; coverImageUrl?: string; url?: string }, { file: File; imageKind: "avatar" | "cover" | "kosher" | "form3010" | "gallery" }>({
      query: ({ file, imageKind }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("imageKind", imageKind);
        return { url: "/v1/auth/me/media/upload-file", method: "POST", body: formData };
      },
      transformResponse: (response: unknown) => {
        const r = response as any;
        return (r?.data ?? r) as { avatarImageUrl?: string; coverImageUrl?: string; url?: string };
      },
    }),
  };
}
