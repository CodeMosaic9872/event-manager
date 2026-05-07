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
      transformResponse: (response: { id: string; email: string; roles: string[] }) => ({
        id: response.id,
        email: response.email,
        roles: toRole(response.roles),
      }),
      providesTags: ["Auth"],
    }),
  };
}
