import type { EndpointBuilder } from "@reduxjs/toolkit/query";
import type {
  CreateConversationResponse,
  NotificationPreferences,
  SendMessagePayload,
} from "@/shared/api/types";

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
      providesTags: ["Notifications"],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (body) => ({ url: "/v1/notifications/preferences", method: "PUT", body }),
      invalidatesTags: ["Notifications"],
    }),
  };
}
