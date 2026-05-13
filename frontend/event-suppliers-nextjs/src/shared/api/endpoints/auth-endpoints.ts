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
        return {
          id: item?.id ?? "",
          email: item?.email ?? "",
          roles: Array.isArray(item?.roles) ? item.roles.map((role: string) => role.toLowerCase() as AuthUser["roles"][number]) : [],
          avatarImageUrl: item?.avatarImageUrl ?? null,
          coverImageUrl: item?.coverImageUrl ?? null,
          supplier: item?.supplier ?? null,
          marketplaceProfile: item?.supplier?.marketplaceProfile ?? null,
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
