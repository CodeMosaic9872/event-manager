"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrateAuth } from "@/features/auth/auth-slice";
import type { AuthUser } from "@/shared/types";

const AUTH_STORAGE_KEY = "event-suppliers/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          user: AuthUser | null;
          accessToken: string | null;
          refreshToken: string | null;
          aiMessageCount?: number;
        };
        store.dispatch(
          hydrateAuth({
            user: parsed.user ?? null,
            accessToken: parsed.accessToken ?? null,
            refreshToken: parsed.refreshToken ?? null,
            aiMessageCount: parsed.aiMessageCount ?? 0,
          }),
        );
      }
    } catch {
      /* ignore malformed persisted auth */
    }

    const unsubscribe = store.subscribe(() => {
      const { auth } = store.getState();
      if (!auth.user) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: auth.user,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          aiMessageCount: auth.aiMessageCount,
        }),
      );
    });

    setHydrated(true);
    return () => unsubscribe();
  }, []);

  if (!hydrated) return null;
  return <Provider store={store}>{children}</Provider>;
}
