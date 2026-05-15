import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type {
  CreateConversationResponse,
  NotificationPreferences,
  SendMessagePayload,
} from "@/shared/api/types";

function unwrapApiData<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw && (raw as { data: unknown }).data !== undefined) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function normalizeNotificationPreferencesPayload(raw: unknown): NotificationPreferences {
  const inner = unwrapApiData<Record<string, unknown>>(raw);
  const row =
    inner &&
    typeof inner === "object" &&
    "items" in inner &&
    Array.isArray((inner as { items: unknown }).items) &&
    (inner as { items: unknown[] }).items.length > 0
      ? (inner as { items: NotificationPreferences[] }).items[0]
      : (inner as NotificationPreferences);
  return row;
}

export function createAiAndNotificationEndpoints(builder: EndpointBuilder<any, any, any>) {
  return {
    createConversation: builder.mutation<CreateConversationResponse, { eventType?: string }>({
      query: (body) => ({ url: "/v1/ai/conversations", method: "POST", body }),
    }),
    sendConversationMessage: builder.mutation<
      { reply?: string; recommendations?: Array<{ supplierId: string; businessName?: string }> },
      SendMessagePayload
    >({
      query: ({ id, message }) => ({
        url: `/v1/ai/conversations/${id}/messages`,
        method: "POST",
        body: { message },
      }),
    }),
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({ url: "/v1/notifications/preferences" }),
      transformResponse: (raw: unknown) => normalizeNotificationPreferencesPayload(raw),
      providesTags: ["Notifications"],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (body) => ({ url: "/v1/notifications/preferences", method: "PUT", body }),
      transformResponse: (raw: unknown) => normalizeNotificationPreferencesPayload(raw),
      invalidatesTags: ["Notifications"],
    }),
  };
}
