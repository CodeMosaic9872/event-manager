"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { hydrateAuth, markAuthHydrated } from "@/features/auth/auth-slice";
import type { AuthUser } from "@/shared/types";

const AUTH_KEY = "auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const initRef = useRef(false);

  useEffect(() => {
    let savedUser: AuthUser | null = null;
    let savedAccess: string | null = null;
    let savedRefresh: string | null = null;
    let savedCount = 0;

    try {
      const raw = window.localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          user: AuthUser | null;
          accessToken: string | null;
          refreshToken: string | null;
          aiMessageCount?: number;
        };
        savedUser = parsed.user ?? null;
        savedAccess = parsed.accessToken ?? null;
        savedRefresh = parsed.refreshToken ?? null;
        savedCount = parsed.aiMessageCount ?? 0;
      }
    } catch {
      /* ignore */
    }

    if (savedUser && savedAccess) {
      store.dispatch(
        hydrateAuth({
          user: savedUser,
          accessToken: savedAccess,
          refreshToken: savedRefresh,
          aiMessageCount: savedCount,
        }),
      );
    } else {
      store.dispatch(markAuthHydrated());
    }

    initRef.current = true;

    const unsubscribe = store.subscribe(() => {
      if (!initRef.current) return;
      const { auth } = store.getState();
      if (!auth.user || !auth.accessToken) {
        window.localStorage.removeItem(AUTH_KEY);
        return;
      }
      window.localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          user: auth.user,
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          aiMessageCount: auth.aiMessageCount,
        }),
      );
    });

    return () => unsubscribe();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
