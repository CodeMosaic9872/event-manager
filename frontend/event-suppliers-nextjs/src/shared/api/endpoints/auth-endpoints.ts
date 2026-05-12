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
} from "@/shared/api/types";

const toRole = (roles: string[]): AuthUser["roles"] =>
  roles.map((role) => role.toLowerCase() as AuthUser["roles"][number]);

function unwrapMePayload(response: unknown): Record<string, unknown> {
  const r = response as Record<string, unknown> | null | undefined;
  if (!r || typeof r !== "object") return {};
  const data = r.data;
  const payload = data !== undefined && data !== null && typeof data === "object" ? (data as Record<string, unknown>) : r;
  if (Array.isArray(payload.items) && payload.items.length > 0) {
    return payload.items[0] as Record<string, unknown>;
  }
  return payload;
}

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
        const row = unwrapMePayload(response);
        return {
          id: String(row.id ?? ""),
          email: String(row.email ?? ""),
          roles: toRole(Array.isArray(row.roles) ? (row.roles as string[]) : []),
        };
      },
      providesTags: ["Auth"],
    }),
  };
}
