import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser, UserRole } from "@/shared/types";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  aiMessageCount: number;
  isHydrated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  aiMessageCount: 0,
  isHydrated: false,
};

const ROLE_PRIORITY: UserRole[] = ["admin", "supplier", "user", "guest"];
const VALID_ROLES = new Set<UserRole>(ROLE_PRIORITY);

function normalizeRoles(input: unknown): UserRole[] {
  if (!Array.isArray(input)) return [];
  const normalized = input
    .map((value) => (typeof value === "string" ? value.toLowerCase() : ""))
    .filter((value): value is UserRole => VALID_ROLES.has(value as UserRole));
  return Array.from(new Set(normalized)).sort(
    (a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b),
  );
}

function normalizeUser(user: AuthUser | null | undefined): AuthUser | null {
  if (!user) return null;
  const roles = normalizeRoles(user.roles);
  return {
    ...user,
    roles: roles.length ? roles : ["user"],
  };
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      state.user = normalizeUser(action.payload.user);
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.aiMessageCount = action.payload.aiMessageCount ?? 0;
      state.isHydrated = true;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken?: string;
        refreshToken?: string;
      }>,
    ) => {
      const incomingUser = normalizeUser(action.payload.user);
      const existingUser = state.user;
      if (!incomingUser) {
        state.user = null;
      } else if (
        existingUser &&
        (existingUser.id === incomingUser.id ||
          existingUser.email.toLowerCase() === incomingUser.email.toLowerCase())
      ) {
        const hasPrivilegedExistingRole = existingUser.roles.some(
          (role) => role === "supplier" || role === "admin",
        );
        const incomingHasPrivilegedRole = incomingUser.roles.some(
          (role) => role === "supplier" || role === "admin",
        );
        state.user =
          hasPrivilegedExistingRole && !incomingHasPrivilegedRole
            ? {
                ...incomingUser,
                roles: normalizeRoles([...existingUser.roles, ...incomingUser.roles]),
              }
            : incomingUser;
      } else {
        state.user = incomingUser;
      }
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isHydrated = true;
    },
    markAuthHydrated: (state) => {
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.aiMessageCount = 0;
      state.isHydrated = true;
    },
    incrementAiMessageCount: (state) => {
      state.aiMessageCount += 1;
    },
  },
});

export const { hydrateAuth, setCredentials, markAuthHydrated, logout, incrementAiMessageCount } =
  authSlice.actions;
export default authSlice.reducer;
