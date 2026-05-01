import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/shared/types";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  aiMessageCount: number;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  aiMessageCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken?: string;
        refreshToken?: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken ?? null;
      state.refreshToken = action.payload.refreshToken ?? null;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.aiMessageCount = 0;
    },
    incrementAiMessageCount: (state) => {
      state.aiMessageCount += 1;
    },
  },
});

export const { setCredentials, logout, incrementAiMessageCount } = authSlice.actions;
export default authSlice.reducer;
